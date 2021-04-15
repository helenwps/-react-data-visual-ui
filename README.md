data-visual-ui

# 目录结构

README.md   项目说明

app/

​	assets   静态资源

​	components  组件

​	containers 页面

​	utils  工具

​	app.tsx  入口js

​	index.html  入口页面

appveyor.yml

babel.config.js   高级语法编译配置

build/	打包后的目录

internals/

​	webpack   	webpack打包配置文件

jest.config.js

libs/	react的拖拽库

node_modules/  npm包

package-lock.json

package.json  

postcss.config.js   css编译配置

server/    开发服务

share/	分享页面

stats.json

tsconfig.json

tslint.json

typings/

# 备注

# 开发打包步骤

## 开发

npm install

npm run start  开启开发服务器 端口号5002

解压server目录下的nginx_stable.zip（不要放到项目目录里面）,解压后的目录是nginx-1.8.1

使用server/nginx.conf  覆盖nginx-1.8.1\conf\nginx.conf

cmd命令行启动nginx

cd nginx-1.8.1

输入nginx.exe  回车

访问http://localhost:5000/

此时nginx服务会反向代理到前端项目的开发服务

如果路径中包含api  会反向代理到后端服务

## 上线打包

npm run build

打包后的项目在build目录