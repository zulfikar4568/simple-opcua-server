import { AddressSpace, DataType, MessageSecurityMode, OPCUAServer, SecurityPolicy, Variant, VariantArrayType } from "node-opcua";
import os from 'os';

function constructAddressSpace(addressSpace: AddressSpace) {
  const namespace = addressSpace.getOwnNamespace();

  const myDevice = namespace.addFolder('ObjectsFolder', {
    browseName: 'MyDevice',
  });

  const variable1 = 10.0

  // Variable 1
  namespace.addVariable({
    componentOf: myDevice,
    nodeId: 's=Temperature',
    browseName: 'Temperature',
    dataType: 'Double',
    minimumSamplingInterval: 500,
    accessLevel: 'CurrentRead',
    value: {
      get: () => {
        const time = Date.now() / 10000.0;
        const value = variable1 + 10.0 * Math.sin(time);
        return new Variant({ dataType: DataType.Double, value });
      }
    }
  })

  // Variable 2
  const learnVariable = namespace.addVariable({
    componentOf: myDevice,
    browseName: 'MyVariable2',
    dataType: 'String'
  });
  learnVariable.setValueFromSource({
    dataType: DataType.String,
    value: 'Learn Node-OPCUA ! Read https://leanpub.com/node-opcuabyexample'
  });

  // Variable 3
  const arrayOfData = namespace.addVariable({
    componentOf: myDevice,
    browseName: 'MyVariable3',
    dataType: 'Double',
    arrayDimensions: [3],
    accessLevel: 'CurrentRead | CurrentWrite',
    userAccessLevel: 'CurrentRead | CurrentWrite',
    valueRank: 1

  });
  arrayOfData.setValueFromSource({
    dataType: DataType.Double,
    arrayType: VariantArrayType.Array,
    value: [1.0, 2.0, 3.0]
  });

  // Variable 4
  namespace.addVariable({
    componentOf: myDevice,
    nodeId: 'b=1020ffab',
    browseName: 'Percentage Memory Used',
    dataType: 'Double',
    minimumSamplingInterval: 1000,
    value: {
      get: () => {
        // const value = process.memoryUsage().heapUsed / 1000000;
        const percentageMemUsed = 1.0 - (os.freemem() / os.totalmem());
        const value = percentageMemUsed * 100;
        return new Variant({ dataType: DataType.Double, value });
      }
    }
  })
}

(async function() {
  try {
    const server = new OPCUAServer({
      port: 26543,
      hostname: 'localhost',
      buildInfo: {
        productName: 'Sample of OPCUA Server',
        buildNumber: '123',
        buildDate: new Date(2024, 5, 20)
      },
      securityPolicies: [SecurityPolicy.None, SecurityPolicy.Basic256Sha256]
    })
    
    await server.initialize();

    if (server.engine.addressSpace !== null) constructAddressSpace(server.engine.addressSpace)

    // we can now start the server
    await server.start();
  
    console.log('Server is now listening ... ( press CTRL+C to stop) ');
    server.endpoints[0].endpointDescriptions().forEach((endpoint) => {
      console.log(endpoint.endpointUrl, MessageSecurityMode[endpoint.securityMode], endpoint.securityPolicyUri?.toString().padEnd(60));
      console.log("    ", endpoint.userIdentityTokens?.map((x) => x.policyId?.toString()).join(' '));
    });
    await new Promise((resolve) => process.once("SIGINT",resolve));
  
    await server.shutdown();
    console.log('server shutdown completed !');
  } catch (err: any) {
    console.log(err.message);
    process.exit(-1);
  }
})();

