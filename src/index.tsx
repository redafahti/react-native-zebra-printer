import { NativeModules, NativeEventEmitter, Platform } from 'react-native';

import * as EPToolkit from './utils/EPToolkit';
import { processColumnText } from './utils/print-column';
import { COMMANDS } from './utils/printer-commands';

const LINKING_ERROR =
  `The package 'react-native-zebra-ble-printer' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

const ZebraBlePrinter = NativeModules.ZebraBlePrinter
  ? NativeModules.ZebraBlePrinter
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

export interface PrinterOptions {
  beep?: boolean;
  cut?: boolean;
  tailingLine?: boolean;
  encoding?: string;
}

export enum PrinterWidth {
  '58mm' = 58,
  '80mm' = 80,
}

export interface PrinterImageOptions {
  beep?: boolean;
  cut?: boolean;
  tailingLine?: boolean;
  encoding?: string;
  imageWidth?: number;
  imageHeight?: number;
  printerWidthType?: PrinterWidth;
  // only ios
  paddingX?: number;
}

export enum ColumnAlignment {
  LEFT,
  CENTER,
  RIGHT,
}

const textTo64Buffer = (text: string, opts: PrinterOptions) => {
  const defaultOptions = {
    beep: false,
    cut: false,
    tailingLine: false,
    encoding: 'UTF8',
  };

  const options = {
    ...defaultOptions,
    ...opts,
  };

  const fixAndroid = '\n';
  const buffer = EPToolkit.exchange_text(text + fixAndroid, options);
  return buffer.toString('base64');
};

const billTo64Buffer = (text: string, opts: PrinterOptions) => {
  const defaultOptions = {
    beep: true,
    cut: true,
    encoding: 'UTF8',
    tailingLine: true,
  };
  const options = {
    ...defaultOptions,
    ...opts,
  };
  const buffer = EPToolkit.exchange_text(text, options);
  return buffer.toString('base64');
};

const BLEPrinter = {
  init: (): Promise<void> =>
    new Promise((resolve, reject) =>
      ZebraBlePrinter.init(
        () => resolve(),
        (error: Error) => reject(error)
      )
    ),

  getDeviceList: (): Promise<IBLEPrinter[]> =>
    new Promise((resolve, reject) =>
      ZebraBlePrinter.getDeviceList(
        (printers: IBLEPrinter[]) => resolve(printers),
        (error: Error) => reject(error)
      )
    ),

  connectPrinter: (inner_mac_address: string): Promise<IBLEPrinter> =>
    new Promise((resolve, reject) =>
      ZebraBlePrinter.connectPrinter(
        inner_mac_address,
        (printer: IBLEPrinter) => resolve(printer),
        (error: Error) => reject(error)
      )
    ),

  closeConn: (): Promise<void> =>
    new Promise((resolve) => {
      ZebraBlePrinter.closeConn();
      resolve();
    }),

  printText: (text: string, opts: PrinterOptions = {}): void => {
    ZebraBlePrinter.printRawData(textTo64Buffer(text, opts), (error: Error) =>
      console.warn(error)
    );
  },

  printBill: (text: string, opts: PrinterOptions = {}): void => {
    ZebraBlePrinter.printRawData(billTo64Buffer(text, opts), (error: Error) =>
      console.warn(error)
    );
  },
  /**
   * image url
   * @param imgUrl
   * @param opts
   */
  printImage: function (imgUrl: string, opts: PrinterImageOptions = {}) {
    ZebraBlePrinter.printImageData(
      imgUrl,
      opts?.imageWidth ?? 0,
      opts?.imageHeight ?? 0,
      (error: Error) => console.warn(error)
    );
  },
  /**
   * base 64 string
   * @param Base64
   * @param opts
   */
  printImageBase64: function (Base64: string, opts: PrinterImageOptions = {}) {
    ZebraBlePrinter.printImageBase64(
      Base64,
      opts?.imageWidth ?? 0,
      opts?.imageHeight ?? 0,
      (error: Error) => console.warn(error)
    );
  },
  /**
   * android print with encoder
   * @param text
   */
  printRaw: (text: string): void => {
    ZebraBlePrinter.printRawData(text, (error: Error) => console.warn(error));
  },
  /**
   * `columnWidth`
   * 80mm => 46 character
   * 58mm => 30 character
   */
  printColumnsText: (
    texts: string[],
    columnWidth: number[],
    columnAlignment: ColumnAlignment[],
    columnStyle: string[],
    opts: PrinterOptions = {}
  ): void => {
    const result = processColumnText(
      texts,
      columnWidth,
      columnAlignment,
      columnStyle
    );
    ZebraBlePrinter.printRawData(textTo64Buffer(result, opts), (error: Error) =>
      console.warn(error)
    );
  },
};

const NetPrinterEventEmitter = new NativeEventEmitter();

export { COMMANDS, BLEPrinter, NetPrinterEventEmitter };

export interface IBLEPrinter {
  device_name: string;
  inner_mac_address: string;
}

export enum RN_THERMAL_RECEIPT_PRINTER_EVENTS {
  EVENT_NET_PRINTER_SCANNED_SUCCESS = 'scannerResolved',
  EVENT_NET_PRINTER_SCANNING = 'scannerRunning',
  EVENT_NET_PRINTER_SCANNED_ERROR = 'registerError',
}

export function multiply(a: number, b: number): Promise<number> {
  return ZebraBlePrinter.multiply(a, b);
}
