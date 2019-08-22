/*
 *  @module $Metadata
 *  @desc Stores the fields per object that we want to use in our tooling queries
 */
var $Metadata = {
  FlowDefinition: ['Id', 'ActiveVersionId', 'ActiveVersion.ProcessType', 
    'ActiveVersion.Status', 'ActiveVersion.CreatedDate', 'ActiveVersion.CreatedBy.Id',
    'ActiveVersion.CreatedBy.Name', 'ActiveVersion.LastModifiedDate', 
    'ActiveVersion.LastModifiedBy.Id', 'ActiveVersion.LastModifiedBy.Name',
    'Description', 'DeveloperName', 'NamespacePrefix', 'LatestVersionId', 'LatestVersion.ProcessType',
    'LatestVersion.Status', 'LatestVersion.CreatedDate', 'LatestVersion.LastModifiedDate', 'LatestVersion.CreatedBy.Name',
    'LatestVersion.LastModifiedBy.Id', 'LatestVersion.LastModifiedBy.Name'
  ],
  ApexClass: ['Id', 'Status', 'IsValid', 'Body', 'CreatedDate', 'CreatedBy.Id',
    'LastModifiedDate', 'LastModifiedBy.Id', 'Name', 'NamespacePrefix',
    'CreatedBy.Name', 'LastModifiedBy.Name'
  ] ,
  ApexTrigger: ['Id', 'Status', 'IsValid', 'Body', 'CreatedDate', 'CreatedBy.Id',
    'LastModifiedDate', 'LastModifiedBy.Id', 'Name', 'NamespacePrefix',
    'CreatedBy.Name', 'LastModifiedBy.Name', 'EntityDefinition.Id',
    'EntityDefinition.DeveloperName'
  ],
  WorkflowRule: ['Id', 'CreatedDate', 'CreatedBy.Id', 'LastModifiedDate', 
    'LastModifiedBy.Id', 'Name', 'NamespacePrefix',
    'CreatedBy.Name', 'LastModifiedBy.Name', 'TableEnumOrId'
  ],
  ValidationRule: ['Id', 'Active', 'EntityDefinition.Id', 'EntityDefinition.DeveloperName', 
    'ValidationName', 'CreatedDate', 'LastModifiedDate', 'CreatedBy.Id', 
    'CreatedBy.Name', 'LastModifiedBy.Id', 'LastModifiedBy.Name', 'NamespacePrefix'
  ]
};