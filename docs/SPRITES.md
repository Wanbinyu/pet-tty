# 动画皮肤(Sprite Skins)

PetDeck 支持动画皮肤:用 PNG 序列帧做桌宠,根据 Claude Code 的状态(空闲 / 思考 / 编辑 / 成功 …)切换动作。DyberPet 格式的角色模组(流萤、纳西妲、魈 等)可以直接导入;也可以从单张图片合成动作。

---

## 1. 导入 DyberPet 角色模组(文件夹)

适合:已有 DyberPet 格式的角色模组。

### 模组文件夹结构(DyberPet 通用格式)

```
角色名/
├── pet_conf.json        # 可选,用于读取角色显示名
├── act_conf.json        # 可选,动作参数(帧间隔/移动);不解析也能用
├── action/              # 必须,所有动作的 PNG 序列帧
│   ├── stand_0.png      # 动作 "stand" 的第 0 帧
│   ├── stand_1.png
│   ├── stand_2.png
│   ├── patpat_0.png     # 动作 "patpat"
│   └── ...
└── note/                # 可选,通知/气泡/语音(本程序忽略)
```

- 帧命名规则:`<动作名>_<序号>.png`,序号从 0 开始连续。
- 程序按文件名前缀自动识别动作,**不依赖 `act_conf.json` 的具体 schema**,所以各种 DyberPet 角色都能直接吃。
- 帧建议带透明背景。

### 导入步骤

1. 右键桌宠 → 更多信息 → 皮肤面板 →「导入动画模组(DyberPet 文件夹)」(右键菜单里也有)。
2. 选择**解压后的角色文件夹**(含 `action/` 的那一层,不是 zip)。
3. 在映射对话框里,把 8 个状态各指派一个动作(有智能默认,可微调),点保存。
4. 等待降采样 + 存储,完成提示后选中该皮肤即可。

### 动作 → 状态映射

默认按动作名关键词自动匹配,可在导入对话框里改:

| PetDeck 状态 | 关键词(命中动作名即映射) |
|---|---|
| `idle` 空闲 | stand / idle / standby / default / relax / sleep |
| `thinking` 思考 | cast / skill / magic / think / study / read / charge |
| `tool_call` 调用工具 | walk / move / run / attack / work / fish / gather |
| `editing` 编辑 | sit / draw / write / craft / build / cook |
| `waiting_user` 等你确认 | wave / greet / hello / beckon / call / invite |
| `running_tests` 跑测试 | dash / sprint / rush / fishing |
| `success` 成功 | patpat / happy / cheer / joy / win / laugh / dance |
| `error` 出错 | cry / sad / fail / hurt / angry / down / loss |

没映射到的状态会**回落到 idle**,所以每个状态都有帧可播。

---

## 2. 从单张图片生成动作(合成)

适合:只有一张角色图,也想让它随状态动起来。

1. 右键 →「从图片生成动作皮肤…」。
2. 选一张图(透明背景的角色图效果最好;带背景的照片会自动抠图)。
3. 程序先**抠图**(去背景,优先 ML,失败回退本地算法),再为 8 个状态各合成几帧变换:
   - idle 呼吸 / thinking 歪头 / tool_call 小跳 / editing 前后倾
   - waiting_user 左右晃 / running_tests 快跳 / success 跳起+落地压扁 / error 抖动
4. 完成后选中即可。

合成动作是**变换类**(缩放/旋转/平移),不是手绘逐帧;适合让任意图片角色"动起来"。要更精细的逐帧动画,仍建议用方式 1 导入真正的序列帧模组。

---

## 状态列表

PetDeck 用 Claude Code 的 8 个 agent 状态驱动动作:

`idle` · `thinking` · `tool_call` · `editing` · `waiting_user` · `running_tests` · `success` · `error`

---

## 存储与版权

- 导入/合成的帧存在浏览器 **IndexedDB**,皮肤元数据(帧数/fps/映射)存在 localStorage。**不进 git 仓库、不上传任何地方**。
- 删除自定义皮肤会一并清掉 IndexedDB 里对应的帧。
- 因此**版权角色素材**(如流萤)由用户自行从画师处下载导入,本仓库不托管任何角色美术。想做内置默认皮肤,请用原创素材。
- 角色模组版权归原作者,请尊重画师劳动,个人使用、勿盗卖。

## 角色模组从哪下

- DyberPet 模组合集(流萤、纳西妲、魈、守岸人 等):<https://github.com/ChaozhongLiu/DyberPet/blob/main/docs/collection.md>
- 下载后按上面"导入步骤"导入即可。
