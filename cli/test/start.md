start
---------

### Usage

    edp test start
    edp test start markdown/*.md
    edp test start [--node]
    edp test start [--singleRun]
    edp test start [--singleRun true]
    edp test start [--singleRun false]
    edp test start [--watch]
    edp test start [--watch true]
    edp test start [--watch false]

### Options

+ --node - 指定测试是否在 Node.js 下运行。
+ --singleRun - 指定是否运行完成后退出。
+ --watch - 是否监测文件改变后重新测试，仅当 singleRun 最终值为 false 时生效。


### Description

运行当前项目的测试服务。
