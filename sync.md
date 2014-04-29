sync
=========

该工具将cordova-mobile-spec的测试集同步到各个对应的plugin repo

Environment
---------

*   安装xsrc工具
*   使用xsrc初始化一个reposet，并clone所有cordova-plugin插件

Command
---------

     npm install
     node sync

Example
---------

```
 cd /<path to reposet>/xface-mobile-spec
 node sync
    
#查看合并结果

cd ..
cd cordova-plugin-battery-status
git status
cd ..

cd cordova-plugin-camera
git status
cd ..

cd cordova-plugin-console
git status
cd ..

cd cordova-plugin-contacts
git status
cd ..

cd cordova-plugin-device
git status
cd ..

cd cordova-plugin-device-motion
git status
cd ..

cd cordova-plugin-device-orientation
git status
cd ..

cd cordova-plugin-dialogs
git status
cd ..

cd cordova-plugin-file
git status
cd ..

cd cordova-plugin-file-transfer
git status
cd ..

cd cordova-plugin-geolocation
pwd
git status
cd ..

cd cordova-plugin-globalization
git status
cd ..

cd cordova-plugin-inappbrowser
git status
cd ..

cd cordova-plugin-media
git status
cd ..

cd cordova-plugin-media-capture
git status
cd ..

cd cordova-plugin-network-information
git status
cd ..

cd cordova-plugin-splashscreen
git status
cd ..

cd cordova-plugin-vibration
git status
cd ..

```

