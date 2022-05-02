features = [
    {
        icon: "./icons/添加.svg",
        title: "添加",
        description: "新增快捷短语"
    },
    {
        icon: "./icons/删除.svg",
        title: "删除",
        description: "移除快捷短语"
    }
]

let menuCache = []

function nextStep(callbackSetList, config, lazy) {
    let defaults = [
        {
            icon: config.nextIcon, title: config.next, description: config.nextDescription
        }
    ]
    window.utools.setSubInput(val => {
        config.title = val.text
        callbackSetList([{icon: config.icon, title: config.title, description: config.description }].concat(defaults))
    }, config.placeholder)
    if(!lazy) callbackSetList([{icon: config.icon, title: config.title, description: config.description }].concat(defaults))
}

function menu(callbackSetList, config, lazy) {
    let defaults = [
        {
            icon: config.nextIcon, title: config.next, description: config.nextDescription
        },
        {
            icon: config.backIcon, title: config.back, description: config.backDescription
        }
    ]
    window.utools.setSubInput(val => {
        config.title = val.text
        callbackSetList([{icon: config.icon, title:config.title, description: config.description }].concat(defaults))
    }, config.placeholder)
    if(!lazy) callbackSetList([{icon: config.icon, title:config.title, description: config.description }].concat(defaults))
}

window.exports = {
    'kfzs': {
        mode: 'list',
        args: {
            enter: (action, callbackSetList) => {
                callbackSetList(features)
            },
            select: (action, itemData, callbackSetList) => {
                switch (itemData.description) {
                    case "设置快捷短语编码":
                        nextStep(callbackSetList, menuCache[0], false)
                        break;
                    case "新增快捷短语":
                        menuCache.push({
                            icon: "./icons/编号.svg",
                            title: "",
                            placeholder: "输入快捷短语编码",
                            description: "快捷短语编码",
                            nextIcon: "./icons/下一步.svg",
                            next: "下一步",
                            nextDescription: "设置快捷短语内容"
                        })
                        nextStep(callbackSetList, menuCache[0], true)
                        break;
                    case "设置快捷短语内容":
                        if (!menuCache[1]) {
                            menuCache.push({
                                icon: "./icons/文件-查找内容.svg",
                                placeholder: "输入快捷短语内容",
                                description: "快捷短语内容",
                                nextIcon: "./icons/提交.svg",
                                next: "完成",
                                nextDescription: "添加快捷短语完毕",
                                backIcon: "./icons/上一步.svg",
                                back: "上一步",
                                backDescription: "设置快捷短语编码"
                            })
                            menu(callbackSetList, menuCache[1], true)
                        } else {
                            menu(callbackSetList, menuCache[1], false)
                        }
                        break;
                    case "添加快捷短语完毕":
                        utools.showNotification('快捷短语添加成功')
                        window.utools.outPlugin()
                    default:
                        break;
                }
            }
        }
    }
}