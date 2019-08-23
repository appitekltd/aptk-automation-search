/*
 *  @module $Force
 *  @desc Stores the connected apps used to connect the user
 */
var $Force = { 
  'Sandbox': new Forcetek({
    callbackUrl: 'https://www.appitek.com/success.html',
    consumerKey: '3MVG95NPsF2gwOiM6f7BlORxLo8.feuLKT4GS3Zg8NNZAQXXS0M_b1fvWajpodl.zqD0L.brxxkROjOIdaEU7',
    proxyUrl: 'https://www.appitek.com/tools/forcetek/proxy.php',
    loginUrl: 'https://test.salesforce.com/',
    apiVersion: 'v42.0'
  }),
  'Production': new Forcetek({
    callbackUrl: 'https://www.appitek.com/success.html',
    consumerKey: '3MVG95NPsF2gwOiM6f7BlORxLo8.feuLKT4GS3Zg8NNZAQXXS0M_b1fvWajpodl.zqD0L.brxxkROjOIdaEU7',
    proxyUrl: 'https://www.appitek.com/tools/forcetek/proxy.php',
    loginUrl: 'https://login.salesforce.com/',
    apiVersion: 'v42.0'
  }),
  'Salesforce': {}
};