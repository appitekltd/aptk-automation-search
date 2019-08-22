/*
 *  @module $App
 *  @desc Core controller for the UI
 */
var $App = new Vue({
  el: '#search',
  data: {
    options: {
      apex: true,
      rules: false,
      flows: true,
      packages: false,
      workflows: false,
      environment: 'Production'
    },
    loading: '',
    email: '',
    total: 0,
    processed: 0,
    all: false,
    query: '',
    url: '',
    filter: '',
    types: ['ApexClass', 'ApexTrigger', 'Flow', 'WorkflowRule', 'ValidationRule'],
    authenticated: false,
    automation: []
  },
  computed: {
    'filteredAutomation': function() {
      var query = this.query.toLowerCase();
      return this.automation.filter(function(a) {
        a.Locations = [];
        if (query == '') return true;
        if (a.Type == 'ValidationRule') {
          var metadata = a.Metadata;
          for (var key in metadata) {
            var value = (metadata[key] + '').toLowerCase();
            if (value.indexOf(query) != -1) {
              a.Locations.push({
                Name: key,
                Type: ''
              });
            }
          }
        } else if (a.Type == 'ApexClass' || a.Type == 'ApexTrigger') {
          if (!a.Body) return false;
          var lines = a.Body.split(/\n/);
          for (var b = 0; b < lines.length; b++) {
            var line = lines[b].toLowerCase();
            if (line.indexOf(query) != -1) {
              a.Locations.push({
                Line: b + 1
              });
            }
          }
        } else {
          var metadata = a.Metadata;
          for (var key in metadata) {
            if (metadata[key] != null) {
              for (var b = 0; b < metadata[key].length; b++) {
                var name = metadata[key][b].name;
                var string = JSON.stringify(metadata[key][b]).toLowerCase();
                if (string.indexOf(query) != -1) {
                  a.Locations.push({
                    Type: key == 'criteriaItems' ? 'Criteria Items' : 
                      key.charAt(0).toUpperCase() + key.slice(1) + ':',
                    Name: name
                  });
                }
              }
            }
          }
        }
        if (a.Locations.length > 0) return true;
        return false;
      })
    }
  },
  methods: {
    /*
     *  @method $App.buildURL()
     *  @desc Creates the Tooling API SQL query for a given object and fields
     *  
     *  @params {String} object - API name of the object
     *  @params {List<String>} fields - list of fields to retrieve
     *  
     *  @return {String} returns the relative URL for the query
     */
    buildURL : function(object, fields) {
      var base = 'v42.0/tooling/query/?q=';
      var query = 'SELECT ' + fields.join(',') + ' FROM ' + object;
      if ($App.options.packages == false) query += ' WHERE NamespacePrefix = \'\'';
      return base + encodeURIComponent(query);
    },
    /*
     *  @method $App.checkLoaded()
     *  @desc Checks if we have processed all the seperate Tooling queries
     *      and sets the App as loaded if we have
     * 
     *  @return {Null}
     */
    checkLoaded: function() {
      $App.processed ++;
      if ($App.processed == $App.total) {
        $App.parseAutomations(0, $App.automation, function() {
          $App.loading = '';
        });
      }
    },
    /*
     *  @method $App.convertDate()
     *  @desc Converts an ISO time string into a time and date string in the 
     *      format of HH:MM:SS DD/MM/YYYY
     * 
     *  @params {String} value - ISO date to convert
     * 
     *  @return {String} - returns converted string
     */
    convertDate: function(value) {
      if (value == null) return '';
      var date = value.split('T')[0].split('-');
      var time = value.split('T')[1].split('.')[0];
      return time + ' ' + date[2] + '/' + date[1] + '/' + date[0];
    },
    /*
     *  @method $App.getData()
     *  @desc Get's initial record data for a given object through the Tooling 
     *    API, then processes the result
     * 
     *  @params {String} object - Tooling API name of the object to get
     * 
     *  @return {Null}
     */
    getData: function(object) {
      $App.total ++;
      var fields = $Metadata[object];
      var url = $App.buildURL(object, fields);
      $App.queryAPI(url, function(res) {
        if (object == 'FlowDefinition') object = 'Flow';
        $App.processData(res.records, object);
      })
    },
    /*
     *  @method $App.getData()
     *  @desc For a given field name we check the various places that field could 
     *    be based on the type of automation
     * 
     *  @params {String} field - Field to get
     *  @params {Object} record - raw data from the Tooling API
     *  @params {String} object - Tooling API name of the object for this record
     * 
     *  @return {String} - returns the value for the requested field
     */
    getField: function(field, record, object) {
      if (field == 'Name') {
        if (object == 'Flow') return record.DeveloperName;
        if (object == 'WorkflowRule') return record.Name;
        if (object == 'ValidationRule') return record.ValidationName;
        return record.Name || '-';
      }
      if (field == 'CreatedDate') {
        if (object == 'Flow') return record.ActiveVersion != null ? 
          record.ActiveVersion.CreatedDate : record.LatestVersion != null ? 
          record.LatestVersion.CreatedDate : '-';
        return record.CreatedDate || '-';
      }
      if (field == 'LastModifiedDate') {
        if (object == 'Flow') return record.ActiveVersion != null ? 
          record.ActiveVersion.LastModifiedDate : record.LatestVersion != null ? 
          record.LatestVersion.LastModifiedDate : '-';
        return record.LastModifiedDate || '-';
      }
      if (field == 'LastModifiedBy') {
        if (object == 'Flow') return record.ActiveVersion != null ? 
          record.ActiveVersion.LastModifiedBy.Name : record.LatestVersion != null ? 
          record.LatestVersion.LastModifiedBy.Name : '-';
        return record.LastModifiedBy ? record.LastModifiedBy.Name : '-';
      }
      if (field == 'Status') {
        if (object == 'Flow') return record.ActiveVersion != null ? 
          record.ActiveVersion.Status : record.LatestVersion != null ? 
          record.LatestVersion.Status : '-';
        return record.Status || 'Active';
      }
    },
    /*
     * @method $App.loadData()
     * @desc Runs all the initial Tooling queries for each of the automation 
     *  types that the user selected during the login phase
     * 
     * @return {Null}
     */
    loadData: function() {
      $App.loading = 'Loading..';
      $App.total = 0;
      $App.processed = 0;
      $App.automation = [];
      if ($App.options.flows == true) {
        $App.getData('FlowDefinition');
      }
      if ($App.options.rules == true) {
        $App.getData('ValidationRule');
      }
      if ($App.options.workflows == true) {
        $App.getData('WorkflowRule');
      }
      if ($App.options.apex == true) {
        $App.getData('ApexClass');
        $App.getData('ApexTrigger');
      }
    },
    /*
     *  @method $App.loginUser()
     *  @desc Logs a user in using the ForceTek framework, shows a popup and 
     *    returns the tooling api url we need
     * 
     *  @return {Null}
     */
    loginUser: function() {
      $App.loading = 'Authenticating..';
      $Force[$App.options.environment].login(function(client) {
        $App.authenticated = true;
        $App.url = $Force[$App.options.environment].url();
        $App.email = $Force[$App.options.environment].client().email;
        $App.loadData();
      });
    },
    /*
     *  @method $App.logoutUser()
     *  @desc Logs a user out by resetting all values on the app, as if they
     *    had refreshed the page
     * 
     *  @return {Null}
     */
    logoutUser: function() {
      $App.authenticated = false;
      $App.url = '';
      $App.email = '';
      $App.options = {
        apex: true,
        rules: false,
        flows: true,
        packages: false,
        workflows: false,
        environment: 'Production'
      },
      $App.search = '';
      $App.filter = '';
      $App.all = false;
      $App.loading = '';
    },
    /*
     *  @method $App.processData()
     *  @desc Processes a given set of records we returned from the Tooling API
     *    so that we can unify them, then checks if we've finished all processing
     * 
     *  @params {List<Object>} records - records to process
     *  @params {String} object - automation object name
     * 
     *  @return {Null}
     */
    processData: function(records, object) {
      records.forEach(function(record) {
        var createdDate = $App.getField('CreatedDate', record, object);
        var modifiedDate = $App.getField('LastModifiedDate', record, object);
        var modifiedBy = $App.getField('LastModifiedBy', record, object);
        var type = record != null && record.ProcessType != null ? record.ProcessType : object;
        var id = record.ActiveVersionId != null ? record.ActiveVersionId : record.Id;
        if ($App.types.indexOf(type) == -1 && type != null) $App.types.push(type);
        $App.automation.push({
          Id: id,
          Selected: false,
          Name: $App.getField('Name', record, object),
          Type: type,
          Object: record.EntityDefinition != null ? record.EntityDefinition.DeveloperName : '-',
          Status: record != null && record.Status != null ? record.Status : $App.getField('Status', record, object),
          CreatedDate: $App.convertDate(createdDate),
          LastModifiedDate: $App.convertDate(modifiedDate),
          Package: record.NamespacePrefix != null ? record.NamespacePrefix : '-',
          LastModifiedBy: modifiedBy,
          Locations: [],
          Metadata: record.Body || null,
          Export: null,
          _raw: record
        });
      });
      $App.checkLoaded();
    },
    /*
     *  @method $App.parseAutomations()
     *  @desc Runs a parse on all the given records 1 by 1, as it's an async
     *    callback for a single 'parse'
     * 
     *  @params {Integer} count - starting number
     *  @params {List<Object>} records - records to parse 1 by 1
     *  @params {Function} callback - callback to return to
     * 
     *  @callback - function with no parameters
     */
    parseAutomations: function(count, records, callback) {
      console.log('CALLING', count, records.length);
      if (count < records.length) {
        $App.parseAutomation(records[count], function() {
          $App.parseAutomations(count + 1, records, callback);
        });
      } else {
        callback();
      }
    },
    /*
     *  @method $App.parseAutomation()
     *  @desc Runs a parse on all the given record by getting the Metadata for
     *    that automation directly, then running it through the $Parser module
     *    to create a human readable format of the process
     * 
     *  @params {Object} record - records to parse
     *  @params {Function} callback - callback to return to
     * 
     *  @callback - function with no parameters
     */
    parseAutomation: function(record, callback) {
      console.log('CALLING');
      $App.loading = 'Loading metadata for ' + record.Name + '..';
      var object = record.Type;
      // if it's a flow we need to use the active or latest version id as the id
      // rather than the actual record id
      var id = record._raw.ActiveVersionId != null ? 
        record._raw.ActiveVersionId : record._raw.LatestVersionId != null ? 
        record._raw.LatestVersionId : record.Id;
      var base = 'v42.0/tooling/query/?q=';
      var query = object == 'Flow' ? 'SELECT Metadata, Status, Processtype FROM ' : 'SELECT Metadata FROM ';
      query += object + ' WHERE Id =\'' + id + '\' LIMIT 1';
      var url = base + encodeURIComponent(query);
      $App.queryAPI(url, function(res) {
        if (res.records.length > 0) {
          record.Metadata = res.records[0].Metadata;
          callback();
        } else {
          callback();
        }
      });
    },
    /*
     *  @method $App.queryAPI()
     *  @desc Sends a GET query to the REST API
     * 
     *  @params {String} url
     *  @params {Function} callback - function to callback to
     * 
     *  @callback - function with the following parameters
     *    @params {Object} res - REST API JSON result
     */
    queryAPI: function(url, callback) {
      $Force[$App.options.environment].raw(url, 'GET', null, null, function(err, res) {
        if (err) {
          console.error(err);
        } else {
          callback(res);
        }
      });
    }
  }
});