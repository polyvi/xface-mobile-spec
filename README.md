<!--
#
# Licensed to the Apache Software Foundation (ASF) under one
# or more contributor license agreements.  See the NOTICE file
# distributed with this work for additional information
# regarding copyright ownership.  The ASF licenses this file
# to you under the Apache License, Version 2.0 (the
# "License"); you may not use this file except in compliance
# with the License.  You may obtain a copy of the License at
# 
# http://www.apache.org/licenses/LICENSE-2.0
# 
# Unless required by applicable law or agreed to in writing,
# software distributed under the License is distributed on an
# "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
#  KIND, either express or implied.  See the License for the
# specific language governing permissions and limitations
# under the License.
#
-->
## Mobile Spec Suite ##

This project is a set of automated & manual tests that test Cordova core functionality.

To set up the project, use `createmobilespec/createmobilespec.js`.

### Performance ###

For reference purposes, the document AndroidBridgePerformance_300.pdf in this directory outlines the Android bridge performance using mobile-spec and the manual bridge test. The tests were performed with Cordova 3.0.0.


xFace-Mobile-Spec
=========

该工具主要是配合xmen-cli和xsrc，用于生成所有插件的MobileSpec测试集，在提供了平台参数的情况下，可以生成对应平台测试集的应用安装包。

Environment
---------

*   安装xsrc工具
*   使用xsrc初始化一个reposet，并clone所有插件及xface-test-template仓库
*   如果需要生成平台安装包，使用xsrc工具clone平台引擎仓库

Command
---------

     node index [<platform>... [--build] [--reposet <path>]]
&lt;platform&gt;参数为打包平台名称，指定该参数，则会新建平台工程，该参数可选，且可以同时输入多个，目前支持的平台有android、ios、wp8。
--build选项用于标识是否需要生成平台安装包，该参数仅在指定了&lt;platform&gt;的情况下有效；--reposet选项用于修改cli所使用的reposet路径。

如果用户没有提供&lt;platform&gt;参数，则该命令只导出所有插件spectest的zip包；如果提供了&lt;platform&gt;参数，则生成对应平台的spectest安装包，
安装包格式与具体平台相关。

**注意：提供&lt;platform&gt;参数时，该命令需要当前系统已安装&lt;platform&gt;对应的开发环境才能正常执行**

Example
---------

    cd /<path>/xface-mobile-spec
    node index
    or
    node index android
    or
    node index android --build
    
测试说明
---------
Mobile Spec Test中以下测试项在player中可以不测，但必须保证非player测试通过

* autotest->benchmark
* autotest->whitelist