# 第三方与资产范围

自有 TypeScript 场景、程序配乐、OBJ 生成器和静态播放器采用根 MIT。源项目为个人动效练习，不是 Framefields 官方产品；使用 Framefields 程序化音效，不使用外部商用歌曲。

- [Framefields 2.4.2](https://github.com/gatewai-dev/framefields)：Apache-2.0；依赖由 npm 按锁文件安装，原生二进制和官方 Skill 不打包。完整依赖版本由 package-lock.json 固定，各依赖保留原许可。
- 原成片使用本机合法安装的 Arial Bold 与 HarmonyOS Sans SC Bold 渲染为像素。没有嵌入/分发字体文件；字体不受本项目 MIT 授权。[Microsoft 字体 FAQ](https://learn.microsoft.com/en-us/typography/fonts/font-faq) 区分像素视频输出与字体二进制再分发；[HarmonyOS Sans 官方许可](https://github.com/openharmony/global_system_resources/blob/master/LICENSE_Fonts) 另行约束该字体。
- 重新渲染需自备合法字体。可以通过环境变量替换字体，但字形/排版会随之变化。仓库不下载、托管或解锁 Windows 字体，也不带模型权重、系统 GPU 驱动或 FFmpeg。
- assets 中 WAV 由 src/score.ts 与 src/neon/assets.ts 生成；ring.obj 同样由后者生成。成片、示例帧与分镜由本项目场景生成。
