import { createContext, useState } from 'react'
import { showMessage } from "react-native-flash-message";
import base64 from 'react-native-base64';
import { BleManager } from 'react-native-ble-plx';
import { requestAccessFineLocation } from '../utils/permissions-android';
/* import { 
  //CHARACTERISTIC_ANGLE_CONTROL_UUID,
  CHARACTERISTIC_D_CONTROL_UUID,
  CHARACTERISTIC_I_CONTROL_UUID,
  CHARACTERISTIC_P_CONTROL_UUID,
  CHARACTERISTIC_SELECT_MODE_UUID,
  //SERVICE_ANGLE_CONTROL_UUID,
  SERVICE_PID_CONTROL_UUID, 
  SERVICE_SELECT_MODE_UUID
} from '../utils/constants'; */

import { bleConstants } from '../utils/constants';

export const BLEContext = createContext({});

const BLTManager = new BleManager();

export function BLEProvider({ children }) {

  const [isConnected, setIsConnected] = useState(false);
  const [connectedDevice, setConnectedDevice] = useState(null);

  async function scanDevices() {

   /* const canAccessFineLocation = await requestAccessFineLocation()
    
    console.log('Scanning devices after...');
    if (!canAccessFineLocation) {
      showMessage({
        message: "Permissão negada!",
        description: "Você precisa permitir o acesso a localização para continuar.",
        duration: 5000,
        type: 'danger'
      });
      return;
    }  */

    showMessage({
      message: "Procurando por dispositivos...",
      duration: 3000,
      type: 'info'
    });


    BLTManager.startDeviceScan(null, null, (error, scannedDevice) => {
      if (error) {
        showMessage({
          message: "Erro ao escanear dispositivos!",
          description: "Verifique se o bluetooth e localização está ligado e tente novamente.",
          duration: 5000,
          type: 'danger'
        });

        return false;
      }

      if (scannedDevice && scannedDevice.name === 'BLE_DEMO_ESP32') {

        BLTManager.stopDeviceScan();

        connectDevice(scannedDevice);

        showMessage({
          message: `Conexão estabelecida com o dispositivo ${scannedDevice.name}!`,
          duration: 3000,
          type: "success",
        });

        return true;
      }
    })

    /* setTimeout(() => {
      BLTManager.stopDeviceScan();
    }, 5000); */

  }

  //Connect the device and start monitoring characteristics
  async function connectDevice(device) {
    try {

      const connectedDevice = await device.connect();

      if (!connectedDevice) {
        showMessage({
          message: "Erro ao conectar com o dispositivo!",
          description: "Verifique se o bluetooth e localização está ligado e tente novamente.",
          duration: 5000,
          type: 'danger'
        });
        return;
      }

      setIsConnected(true);
      setConnectedDevice(connectedDevice);

      const allServicesAndCharacteristicsOfDeviceConnected = await connectedDevice.discoverAllServicesAndCharacteristics();
      
      const [ 
        service1,
        service2,
        serviceAngle,
        servicePControl,
        serviceIControl,
        serviceDControl,
        serviceSelectMode,
        serviceSelectSensor
      ]= await connectedDevice.services()
      
      bleConstants.setServiceAngleControlUuid(serviceAngle.uuid);
      bleConstants.setServicePControlUuid(servicePControl.uuid);
      bleConstants.setServiceIControlUuid(serviceIControl.uuid);
      bleConstants.setServiceDControlUuid(serviceDControl.uuid);
      bleConstants.setServiceSelectModeUuid(serviceSelectMode.uuid);
      bleConstants.setServiceSelectSensorUuid(serviceSelectSensor.uuid);

      BLTManager.characteristicsForDevice(
        connectedDevice.id,
        bleConstants.getServiceAngleControlUuid()
      ).then((characteristics) => bleConstants.setCharacteristicAngleControlUuid(characteristics[0].uuid))

      BLTManager.characteristicsForDevice(
        connectedDevice.id,
        bleConstants.getServicePControlUuid()
      ).then((characteristics) => bleConstants.setCharacteristicPControlUuid(characteristics[0].uuid))

      BLTManager.characteristicsForDevice(
        connectedDevice.id,
        bleConstants.getServiceIControlUuid()
      ).then((characteristics) => bleConstants.setCharacteristicIControlUuid(characteristics[0].uuid))

      BLTManager.characteristicsForDevice(
        connectedDevice.id,
        bleConstants.getServiceDControlUuid()
      ).then((characteristics) => bleConstants.setCharacteristicDControlUuid(characteristics[0].uuid))

      BLTManager.characteristicsForDevice(
        connectedDevice.id,
        bleConstants.getServiceSelectModeUuid()
      ).then((characteristics) => bleConstants.setCharacteristicSelectModeUuid(characteristics[0].uuid))

      BLTManager.characteristicsForDevice(
        connectedDevice.id,
        bleConstants.getServiceSelectSensorUuid()
      ).then((characteristics) => bleConstants.setCharacteristicSelectSensorUuid(characteristics[0].uuid))


      BLTManager.onDeviceDisconnected(
        allServicesAndCharacteristicsOfDeviceConnected.id, (error, device) => {
          showMessage({
            message: "Dispositivo desconectado!",
            duration: 5000,
            type: 'info'
          });
          setIsConnected(false);
          setConnectedDevice(null);
        });
    } catch (error) {
      console.log(error);
    }
  }

  // handle the device disconnection (poorly)
  async function disconnectDevice() {
    showMessage({
      message: "Desconectando do dispositivo...",
      duration: 3000,
      type: 'info'
    });

    await BLTManager.cancelDeviceConnection(connectedDevice.id);

    const connectionStatus = await connectedDevice.isConnected();

    if (!connectionStatus) {
      setIsConnected(false);
    }
  }

  async function writeCharacteristicSelectSensorValue(value) {
    if (connectedDevice) {
      await connectedDevice.writeCharacteristicWithResponseForService(
        bleConstants.getServiceSelectSensorUuid(),
        bleConstants.getCharacteristicSelectSensorUuid(),
        base64.encode(value.toString()),
      );

      return true;
    }

    return false;
  }

  async function writeCharacteristicSelectModeValue(value) {
    if (connectedDevice) {
      await connectedDevice.writeCharacteristicWithResponseForService(
        bleConstants.getServiceSelectModeUuid(),
        bleConstants.getCharacteristicSelectModeUuid(),
        base64.encode(value.toString()),
      );

      return true;
    }

    return false;
  }

  async function writeCharacteristicAngleControlValue(value) {
    if (connectedDevice) {
      await connectedDevice.writeCharacteristicWithResponseForService(
        bleConstants.getServiceAngleControlUuid(),
        bleConstants.getCharacteristicAngleControlUuid(),
        base64.encode(value.toString()),
      );

      return true;
    }

    return false;
  }

  async function writeCharacteristicOfPControlValue(value) {
    if (connectedDevice) {
      await connectedDevice.writeCharacteristicWithResponseForService(
        bleConstants.getServicePControlUuid(),
        bleConstants.getCharacteristicPControlUuid(),
        base64.encode(value.toString()),
      );
      return true;
    }
    return false;
  }

  async function writeCharacteristicOfIControlValue(value) {
    if (connectedDevice) {
      await connectedDevice.writeCharacteristicWithResponseForService(
        bleConstants.getServiceIControlUuid(),
        bleConstants.getCharacteristicIControlUuid(),
        base64.encode(value.toString()),
      );

      return true;
    }

    return false;
  }

  async function writeCharacteristicOfDControlValue(value) {
    if (connectedDevice) {
      await connectedDevice.writeCharacteristicWithResponseForService(
        bleConstants.getServiceDControlUuid(),
        bleConstants.getCharacteristicDControlUuid(),
        base64.encode(value.toString()),
      );

      return true;
    }

    return false;
  }

  return (
    <BLEContext.Provider
      value={{ 
        isConnected,
        scanDevices,
        disconnectDevice,
        writeCharacteristicOfPControlValue,
        writeCharacteristicOfIControlValue,
        writeCharacteristicOfDControlValue,
        writeCharacteristicAngleControlValue,
        writeCharacteristicSelectModeValue,
        writeCharacteristicSelectSensorValue
      }}
    >
      {children}
    </BLEContext.Provider>
  )
}