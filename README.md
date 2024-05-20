## Sample of OPCUA Server
Run the OPC UA Server
```bash
yarn dev
```

## Install OPCUA Client for connecting

[OPCUA Client for Free](https://github.com/FreeOpcUa/opcua-client-gui).

The URL of the OPCUA server that we created it would be `opc.tcp://localhost:26543`. I used mac, so we can install using below commands
```bash
brew install pyqt@5
pip3 install opcua-client pyqtgraph cryptography numpy
```

Open the OPCUA client
```bash
opcua-client
```