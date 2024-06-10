package com.zebrableprinter.adapter;

import android.hardware.usb.UsbDevice;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;

public interface PrinterDevice {

    public PrinterDeviceId getPrinterDeviceId();
    public WritableMap toRNWritableMap();

}
