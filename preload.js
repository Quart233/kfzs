const fs = require('fs')

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
    },
    {
        icon: "./icons/文件-查找内容.svg",
        title: "搜索",
        description: "快速查找快捷短语并粘贴"
    },
    {
        icon: "./icons/导出.svg",
        title: "导出",
        description: "导出快捷短语为JSON文件"
    }
]

let menuCache = []
let inputCache = ""

function nextStep(callbackSetList, config, lazy) {
    let defaults = [
        {
            icon: config.nextIcon, title: config.next, description: config.nextDescription
        }
    ]
    utools.setSubInput(val => {
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
    utools.setSubInput(val => {
        config.title = val.text
        callbackSetList([{icon: config.icon, title:config.title, description: config.description }].concat(defaults))
    }, config.placeholder)
    if(!lazy) callbackSetList([{icon: config.icon, title:config.title, description: config.description }].concat(defaults))
}

function exportWords() {
    let words = JSON.stringify(utools.db.allDocs()," ", 2)
    let d1 = new Date().toISOString().replaceAll(':', '-')
    let defaultPath = `${utools.getPath('downloads')}/${d1}.json`
    let filePath = utools.showSaveDialog({ 
        title: '导出快捷短语',
        defaultPath: defaultPath,
        buttonLabel: '导出'
    })
    if(filePath) {
        fs.writeFile(filePath, words, function(err) {
            if(err) {
                alert(err.message)
            }
        })
    } else {
        utools.outPlugin()
    }
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
                    case "新增快捷短语":
                        utools.redirect("短语新增")
                        break;
                    case "移除快捷短语":
                        utools.redirect("短语删除")
                        break;
                    case "快速查找快捷短语并粘贴":
                        utools.redirect("短语搜索")
                        break;
                    case "导出快捷短语为JSON文件":
                        exportWords()
                        break;
                    default:
                        break;
                }
            }
        }
    },
    'delete': {
        mode: 'list',
        args: {
            enter: (action, callbackSetList) => {
                inputCache = ""
            },
            search: (action, searchWord, callbackSetList) => {
                inputCache = searchWord
                utools.db.promises.allDocs(searchWord).then(docs => callbackSetList(docs.map(doc => Object({title: doc.data, description: doc._id}))))
            },
            select: (action, itemData, callbackSetList) => {
                utools.db.remove(itemData.description)
                utools.db.promises.allDocs(inputCache).then(docs => callbackSetList(docs.map(doc => Object({title: doc.data, description: doc._id}))))
            }
        }
    },
    'add': {
        mode: 'list',
        args: {
            enter: (action, callbackSetList) => {
                switch (action.type) {
                    case "over":
                        menuCache.push({
                            icon: "./icons/编号.svg",
                            title: "",
                            placeholder: "输入快捷短语编码",
                            description: "快捷短语编码",
                            nextIcon: "./icons/下一步.svg",
                            next: "下一步",
                            nextDescription: "添加快捷短语完毕"
                        })
                        menuCache.push({
                            title: action.payload
                        })
                        nextStep(callbackSetList, menuCache[0], true)
                        break;
                
                    default:
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
                }
            },
            select: (action, itemData, callbackSetList) => {
                switch (itemData.description) {
                    case "设置快捷短语编码":
                        nextStep(callbackSetList, menuCache[0], false)
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
                        utools.db.put({
                            _id: menuCache[0].title, // 编码
                            data: menuCache[1].title // 短语内容
                        })
                        utools.showNotification('快捷短语添加成功')
                        utools.outPlugin()
                    default:
                        break;
                }
            }
        }
    },
    'search': {
        mode: 'list',
        args: {
            search: (action, searchWord, callbackSetList) => {
                utools.db.promises.allDocs(searchWord).then(docs => callbackSetList(docs.map(doc => Object({title: doc.data, description: doc._id}))))
            },
            select: (action, itemData, callbackSetList) => {
                utools.copyText(itemData.title)
                utools.hideMainWindow()
            }
        }
    }
}