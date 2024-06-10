
#ifdef RCT_NEW_ARCH_ENABLED
#import "RNZebraBlePrinterSpec.h"

@interface ZebraBlePrinter : NSObject <NativeZebraBlePrinterSpec>
#else
#import <React/RCTBridgeModule.h>

@interface ZebraBlePrinter : NSObject <RCTBridgeModule>
#endif

@end
