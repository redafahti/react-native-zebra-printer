package com.zebrableprinter.adapter;

import android.app.Activity;
import android.content.Context;
import android.graphics.Bitmap;
import android.telecom.Call;

import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;

import java.util.List;

public interface PrinterAdapter {

    public void init(ReactApplicationContext reactContext, Callback successCallback, Callback errorCallback);

    public List<PrinterDevice> getDeviceList(Callback errorCallback);

    public void selectDevice(PrinterDeviceId printerDeviceId, Callback successCallback, Callback errorCallback);

    public void closeConnectionIfExists();

    public void printRawData(String rawBase64Data, Callback errorCallback);

    public void printImageData(String imageUrl, int imageWidth, int imageHeight, Callback errorCallback);

    public void printImageBase64(Bitmap imageUrl, int imageWidth, int imageHeight, Callback errorCallback);
}
