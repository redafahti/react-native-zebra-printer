//@ts-nocheck
import * as React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  PermissionsAndroid,
} from 'react-native';
import { BLEPrinter } from 'react-native-zebra-ble-printer';
import { Buffer } from 'buffer';
import EscPosEncoder from 'esc-pos-encoder';

export default function App() {
  const Print = async () => {
    let encoder: EscPosEncoder = new EscPosEncoder();
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT
          );
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            BLEPrinter.init().then(() => {
              BLEPrinter.connectPrinter('48:A4:93:A1:EF:C7')
                .then(async () => {
                  try {
                    let Header = encoder
                      .initialize()
                      .codepage('auto')
                      .line('') /** New line  */
                      .text('Simple text') /** Test  */
                      .rule({ style: 'double' })
                      .table(
                        [
                          { width: 36, marginRight: 2, align: 'left' },
                          { width: 10, align: 'right' },
                        ],
                        [
                          ['Item 1', '€ 10,00'],
                          ['Item 2', '15,00'],
                          ['Item 3', '9,95'],
                          ['Item 4', '4,75'],
                          ['Item 5', '211,05'],
                          ['', '='.repeat(10)],
                          [
                            'Total',
                            (encoder) => encoder.bold().text('€ 250,75').bold(),
                          ],
                        ]
                      ) /** table  */
                      .encode();
                    let HeaderResult = Buffer.from(Header).toString('base64');

                    BLEPrinter.printRaw(HeaderResult);
                  } catch (err) {
                    console.warn(err);
                  }
                })
                .catch((err) => {
                  console.log(err);
                });
            });
          }
        } catch (err) {
          console.warn(err);
        }
      }
    } catch (err) {
      console.warn(err);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => {
          Print();
        }}
        style={{
          backgroundColor: '#0000ff',
          width: 200,
          height: 40,
          justifyContent: 'center',
          alignContent: 'center',
          alignItems: 'center',
        }}
      >
        <Text
          style={{
            color: '#fff',
            fontSize: 16,
          }}
        >
          Print
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
});
