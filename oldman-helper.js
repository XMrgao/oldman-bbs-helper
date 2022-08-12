// ==UserScript==
// @name         老男人助手
// @namespace    http://tampermonkey.net/
// @version      0.8.1
// @description  适用于老男人游戏论坛:https://bbs.oldmanemu.net/ 的小工具
// @author       rock128
// @match        https://bbs.oldmanemu.net/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        GM_addStyle
// @grant        GM_getResourceText
// @require      https://cdn.bootcdn.net/ajax/libs/jscolor/2.4.7/jscolor.min.js
// @require      https://lf3-cdn-tos.bytecdntp.com/cdn/expire-1-M/jszip/3.7.1/jszip.min.js
// @require      https://lf3-cdn-tos.bytecdntp.com/cdn/expire-1-M/FileSaver.js/2.0.5/FileSaver.min.js
// @resource css https://cdn.staticfile.org/font-awesome/4.7.0/css/font-awesome.css
// @license      GPL-3.0 License
// ==/UserScript==

(function() {
	'use strict';
	GM_addStyle(GM_getResourceText("css"));

	// 旋转图片
	// 自动组合云盘链接
	// 与佛论禅编解码

	var VERSION = 1;

	//所有的功能都在这里定义
	var settingObject = {
		autoSignIn: {
			// 和所属对象属性名保持一致
			id: "autoSignIn",
			// 显示在界面上的标题
			title: "自动签到",
			// 配置变化时是否需要重新加载页面
			needReload: false,
			// 所有用到的配置全部写在这里，config对象会持久化
			// 除 enable 属性外，其他属性要在 configKeyElementMaps 中定义一个同名属性来映射页面元素
			config: {
				enable: false,
				signTitle: "签到"
			},
			// 该功能用到的 config 属性名和 元素class/id的映射
			configKeyElementMaps: {
				// 这行含义是: config.signTitle  和页面上id为sign-key的标签值是对应着的
				signTitle: {
					element: "#sign-key"
				}
			},
			// 功能生效的前提条件检查
			matchCondition: function() {
				return Utils.isMatchPageCategory("index") || Utils.isIndexPage()
			},
			// 功能生效的逻辑代码
			doAction: function() {
				if ($("#sign_title").text() == this.config.signTitle) {
					$.xpost(xn.url("my-sign"), "", function(message) {
						$("#sign_title").text("已签")
					});
				}
			},
			// 功能配置的html代码
			contentHtml: function() {
				let html = `
                        <span class="setting-item-desc-text">保持和签到按钮上的文字完全一致<span></br>
                        <input type="text" id="sign-key" value="${this.config.signTitle}" />
                    `
				return Utils.createDivWithTitle("签到按钮文本", html)
			}
		},
		deng: {
			// 和所属对象属性名保持一致
			id: "deng",
			// 显示在界面上的标题
			title: "去掉节日灯笼",
			// 配置变化时是否需要重新加载页面
			needReload: false,
			// 所有用到的配置全部写在这里，config对象会持久化
			// 除 enable 属性外，其他属性要在 configKeyElementMaps 中定义一个同名属性来映射页面元素
			config: {
				enable: false
			},
			// 该功能用到的 config 属性名和 元素class/id的映射
			configKeyElementMaps: {},
			// 功能生效的前提条件检查
			matchCondition: function() {
				return true
			},
			// 功能生效的逻辑代码
			doAction: function() {
				$(".deng") && $(".deng").remove()
			},
			// 功能配置的html代码
			contentHtml: function() {
				return Utils.createMsgDiv("<h3>从所有页面移除节日灯笼</h3>")
			}
		},
		blacklist: {
			// 和所属对象属性名保持一致
			id: "blacklist",
			// 显示在界面上的标题
			title: "黑名单",
			// 配置变化时是否需要重新加载页面
			needReload: false,
			// 所有用到的配置全部写在这里，config对象会持久化
			// 除 enable 属性外，其他属性要在 configKeyElementMaps 中定义一个同名属性来映射页面元素
			config: {
				enable: false,
				blacklist: {}
			},
			// 该功能用到的 config 属性名和 元素class/id的映射
			configKeyElementMaps: {
				blacklist: {
					element: "#black-list",
					getVal: function() {
						let ret = {}
						if ($(this.element) && $(this.element).val().trim() != "") {
							let info = $(this.element).val().split("\n");
							for (let line of info) {
								let tmpArray = line.split("=")
								ret[tmpArray[0]] = {
									banType: tmpArray[1],
									username: tmpArray[2]
								}
							}
						}
						return ret
					}
				}
			},
			// 功能生效的前提条件检查
			matchCondition: function() {
				return Utils.isMatchPageCategory("") || Utils.isMatchPageCategory("index")
			},
			// 功能生效的逻辑代码
			doAction: function() {
				let configObject = this.config.blacklist
				let isBan = function(userId, type) {
					var blackUserObject = configObject[userId];
					if (!blackUserObject) {
						return false;
					}
					return blackUserObject.banType == type
				}
				let hideBlackListUserContent = function() {
					$(".media.thread.tap") && $(".media.thread.tap").each(function(i, item) {
						var id = $(item).children().eq(0).attr("href")
						id = id.replace("user-", "").replace(".htm", "")
						if (isBan(id, Utils.BLACK_TYPE_ALL) || isBan(id, Utils.BLACK_TYPE_THREAD)) {
							$(item).hide()
						}
					})
					$(".media.post") && $(".media.post").each(function(i, item) {
						var id = $(item).children().eq(0).attr("href")
						id = id.replace("user-", "").replace(".htm", "")
						if (isBan(id, Utils.BLACK_TYPE_ALL) || isBan(id, Utils.BLACK_TYPE_REPLY)) {
							$(item).hide()
						}
					})
				}
				hideBlackListUserContent()
				$(".avatar-3").mouseenter(function() {
					var href = $(this).parent().attr("href")
					var userId = href.split("-")[1].split(".")[0]
					var name = ""
					try {
						// 帖子列表页的路径
						var text = $(this).parent().next().find(".icon-user-o").parent().text()
						name = text.split("于")[0].trim()
						if (name == "") {
							// 帖子详情页的路径
							text = $(this).parent().next().find(".username").first().text()
							name = text.trim()
						}
					} catch (e) {
						console.log(e.message);
					}
					let clickCallBack = function() {
						var id = $(this).attr("user-id")
						var username = $(this).attr("user-name")
						var banType = $(this).attr("banType")
						configObject[id] = {
							banType: banType,
							username: username
						}
						hideBlackListUserContent()
						$("#user-operate-menu").hide();
						Utils.saveConfig(settingObject.blacklist.id)
					}
					let operateMenu = $("#user-operate-menu")
					operateMenu.empty()
					let buttons = [
						Utils.createBlackTypeButton(Utils.BLACK_TYPE_THREAD, userId, name, "屏蔽用户帖子", true),
						Utils.createBlackTypeButton(Utils.BLACK_TYPE_REPLY, userId, name, "屏蔽用户在帖子中的回复", true),
						Utils.createBlackTypeButton(Utils.BLACK_TYPE_ALL, userId, name, "全部屏蔽", true)
					]
					for (let button of buttons) {
						$(button).click(clickCallBack);
						operateMenu.append(button)
					}
					operateMenu.css("position", "absolute");
					operateMenu.css("top", $(this).offset().top);
					operateMenu.css("left", $(this).offset().left - 70);
					operateMenu.show();
					operateMenu.unbind()
					operateMenu.mouseleave(function() {
						operateMenu.hide();
					})
				})
				$('.avatar-3').mouseleave(function() {
					var href = $(this).parent().attr("href")
					var offset = $("#user-operate-menu").offset()
					var width = $("#user-operate-menu").outerWidth(true) + 10
					var height = $("#user-operate-menu").outerHeight(true) + 10
					if (window.__xx && window.__yy) {
						if (window.__xx > Math.ceil(offset.left + width) || window.__yy > Math.ceil(offset.top + height) || window.__xx < Math.ceil(offset.left) || window.__yy < Math.ceil(offset.height)) {
							$("#user-operate-menu").hide();
						}
					}
					//console.log("mouse:"+window.__xx+","+window.__yy+"   div:"+offset.left+","+offset.top+","+width+","+height+"  "+Math.ceil(offset.left + width)+","+Math.ceil(offset.top + height))        
				})
			},
			// 功能配置的html代码
			contentHtml: function() {
				let genBlackList = function() {
					var blackUserInfo = []
					for (let key in this.config.blacklist) {
						let blackUserObject = this.config.blacklist[key]
						blackUserInfo.push(key + "=" + blackUserObject.banType + "=" + blackUserObject.username)
					}
					return blackUserInfo.join("\n")
				}
				let html = `
            <textarea placeholder="要屏蔽的用户id，一行一条配置" class="setting-textarea" id="black-list">${genBlackList.bind(this)()}</textarea>
                    `
				return Utils.createDivWithTitle("名单", html)
			}
		},
		autoReply: {
			// 和所属对象属性名保持一致
			id: "autoReply",
			// 显示在界面上的标题
			title: "自动回复隐藏帖子",
			// 配置变化时是否需要重新加载页面
			needReload: false,
			// 所有用到的配置全部写在这里，config对象会持久化
			// 除 enable 属性外，其他属性要在 configKeyElementMaps 中定义一个同名属性来映射页面元素
			config: {
				enable: false,
				keyword: "此处隐藏内容请回复后再查看",
				msgTemplates: []
			},
			// 该功能用到的 config 属性名和 元素class/id的映射
			configKeyElementMaps: {
				keyword: {
					element: "#hide-key"
				},
				msgTemplates: {
					element: "#auto-reply",
					getVal: function() {
						let val = $(this.element).val().trim()
						return val == "" ? [] : val.split("\n")
					}
				}
			},
			// 功能生效的前提条件检查
			matchCondition: function() {
				return Utils.isMatchPageCategory("thread")
			},
			// 功能生效的逻辑代码
			doAction: function() {
				if ($(".alert-warning") && $(".alert-warning").text().indexOf(this.config.keyword) != -1) {
					var msg = this.config.msgTemplates[Math.floor(Math.random() * this.config.msgTemplates.length)];
					$(".message .form-control").val(msg)
					$("#quick_reply_form").submit()
				}
			},
			// 功能配置的html代码
			contentHtml: function() {
				let html = `
                        <div>
                            ${Utils.createDivWithTitle("识别隐藏内容的关键词",'<input type="text" id="hide-key" value="'+this.config.keyword+'" />')}
                            ${Utils.createDivWithTitle("自动回复消息模板",'<textarea placeholder="页面有隐藏内容自动回复的消息，一行一条，将随机选一条回复" class="setting-textarea" id="auto-reply">'+this.config.msgTemplates.join("\n")+'</textarea>')}                            
                        </div>
                    `
				return html
			}
		},
		keyboardNavigation: {
			// 和所属对象属性名保持一致
			id: "keyboardNavigation",
			// 显示在界面上的标题
			title: "键盘翻页",
			// 配置变化时是否需要重新加载页面
			needReload: false,
			// 所有用到的配置全部写在这里，config对象会持久化
			// 除 enable 属性外，其他属性要在 configKeyElementMaps 中定义一个同名属性来映射页面元素
			config: {
				enable: false
			},
			// 该功能用到的 config 属性名和 元素class/id的映射
			configKeyElementMaps: {},
			// 功能生效的前提条件检查
			matchCondition: function() {
				return true
			},
			// 功能生效的逻辑代码
			doAction: function() {
				$(document).keydown(function(event) {
					if (event.keyCode == 37) {
						let preA = $(".page-link:contains('◀')")
						if (preA && preA.length > 0) {
							window.location.href = preA.attr("href")
						}
					} else if (event.keyCode == 39) {
						let nextA = $(".page-link:contains('▶')")
						if (nextA && nextA.length > 0) {
							window.location.href = nextA.attr("href")
						}
					}
				});
			},
			// 功能配置的html代码
			contentHtml: function() {
				return Utils.createMsgDiv("<h3>用键盘左右箭头翻页</h3>")
			}
		},
		readMode: {
			// 和所属对象属性名保持一致
			id: "readMode",
			// 显示在界面上的标题
			title: "阅读模式",
			// 配置变化时是否需要重新加载页面
			needReload: false,
			// 所有用到的配置全部写在这里，config对象会持久化
			// 除 enable 属性外，其他属性要在 configKeyElementMaps 中定义一个同名属性来映射页面元素
			config: {
				enable: false,
				backgroundColor: '#C7EDCC',
				fontColor: '#000000'
			},
			// 该功能用到的 config 属性名和 元素class/id的映射
			configKeyElementMaps: {
				backgroundColor: {
					element: "#background-color-input"
				},
				fontColor: {
					element: "#font-color-input"
				}
			},
			// 功能生效的前提条件检查
			matchCondition: function() {
				return true
			},
			// 功能生效的逻辑代码
			doAction: function() {
				let config = this.config
				$(document).find("*").each(function(i, item) {
					if ($(item).attr("id") == "setting-panel") {
						return
					}
					if ($(item).parents('#setting-panel').length > 0) {
						return
					}
					let oldCss = item.style.cssText || ""
					$(item).css("cssText", oldCss + "background-color:" + config.backgroundColor + "!important;color:" + config.fontColor + "!important;background-image:none!important;")
				})
			},
			// 功能配置的html代码
			contentHtml: function() {
				let html = `
                        <div>
                            ${Utils.createDivWithTitle("背景色",' <input size="7" data-jscolor="{zIndex:9999}" id="background-color-input" value="'+this.config.backgroundColor+'" /> ')}

                            ${Utils.createDivWithTitle("文字颜色",'<input size="7" id="font-color-input" value="'+this.config.fontColor+'" data-jscolor="{zIndex:9999}">')}
                        </div>
                    `
				return html
			}
		},
		doubleClickScrollTop: {
			// 和所属对象属性名保持一致
			id: "doubleClickScrollTop",
			// 显示在界面上的标题
			title: "双击滚动到顶部",
			// 配置变化时是否需要重新加载页面
			needReload: false,
			// 所有用到的配置全部写在这里，config对象会持久化
			// 除 enable 属性外，其他属性要在 configKeyElementMaps 中定义一个同名属性来映射页面元素
			config: {
				enable: false
			},
			// 该功能用到的 config 属性名和 元素class/id的映射
			configKeyElementMaps: {},
			// 功能生效的前提条件检查
			matchCondition: function() {
				return true
			},
			// 功能生效的逻辑代码
			doAction: function() {
				$(document).dblclick("click", function() {
					$('html,body').animate({
						scrollTop: '0px'
					}, 300)
				});
			},
			// 功能配置的html代码
			contentHtml: function() {
				return Utils.createMsgDiv("<h3>在任意界面双击返回顶部</h3>")
			}
		},
		highlightAuthor: {
			// 和所属对象属性名保持一致
			id: "highlightAuthor",
			// 显示在界面上的标题
			title: "高亮楼主",
			// 配置变化时是否需要重新加载页面
			needReload: false,
			// 所有用到的配置全部写在这里，config对象会持久化
			// 除 enable 属性外，其他属性要在 configKeyElementMaps 中定义一个同名属性来映射页面元素
			config: {
				enable: false,
				backgroundColor: '#96a48b',
				quoteColor: '#b7b1a5'
			},
			// 该功能用到的 config 属性名和 元素class/id的映射
			configKeyElementMaps: {
				backgroundColor: {
					element: "#author-background-color-input"
				},
				quoteColor: {
					element: "#author-quote-background-color-input"
				}
			},
			// 功能生效的前提条件检查
			matchCondition: function() {
				return true
			},
			// 功能生效的逻辑代码
			doAction: function() {
				let config = this.config
				$(".badge.badge-secondary.small.haya-post-info-first-floor").each(function() {
					var block = $(this).parent().parent().parent().parent().get(0)
					let oldCss = block.style.cssText || ""
					$(block).css("cssText", oldCss + "background-color:" + config.backgroundColor + "!important;")
					var quote = $(block).find(".blockquote").get(0)
					if (quote) {
						oldCss = quote.style.cssText || ""
						$(quote).css("cssText", oldCss + "background-color:" + config.quoteColor + "!important;")
					}
				})
			},
			// 功能配置的html代码
			contentHtml: function() {
				let html = `
                        <div>
                            ${Utils.createDivWithTitle("背景色",' <input size="7" data-jscolor="{zIndex:9999}" id="author-background-color-input" value="'+this.config.backgroundColor+'" /> ')}
                            ${Utils.createDivWithTitle("引用背景颜色",'<input size="7" id="author-quote-background-color-input" value="'+this.config.quoteColor+'" data-jscolor="{zIndex:9999}">')}
                        </div>
                    `
				return html
			}
		},
		emojisSupport: {
			// 和所属对象属性名保持一致
			id: "emojisSupport",
			// 显示在界面上的标题
			title: "表情",
			// 配置变化时是否需要重新加载页面
			needReload: false,
			// 所有用到的配置全部写在这里，config对象会持久化
			// 除 enable 属性外，其他属性要在 configKeyElementMaps 中定义一个同名属性来映射页面元素
			config: {
				enable: false
			},
			// 该功能用到的 config 属性名和 元素class/id的映射
			configKeyElementMaps: {},
			// 功能生效的前提条件检查
			matchCondition: function() {
				return Utils.isMatchPageCategory("thread") && !Utils.hasElement(".emojis-panel")
			},
			// 功能生效的逻辑代码
			doAction: function() {
				var emojisPanel = $('<div class="emojis-panel"></div>')
				$("body").append(emojisPanel)
				var emojRange = [
					[128513, 128591],
					[127744, 128511],
					[128640, 128704],
					[9986, 10160]
				];
				for (var i = 0; i < emojRange.length; i++) {
					var range = emojRange[i];
					for (var x = range[0]; x < range[1]; x++) {
						var d = $('<div>&#' + x + ';</div>');
						d.addClass("emoji-item")
						d.attr("code", "0x" + x.toString(16))
						d.click(function() {
							var code = $(this).attr("code")
							var msg = $("#message").val()
							var start = $("#message")[0].selectionStart
							var end = $("#message")[0].selectionEnd
							$("#message").val(msg.substring(0, start) + String.fromCodePoint(code) + msg.substring(end, msg.length))
						})
						emojisPanel.append(d)
					}
				}
				var button = $('<div class="open-emoji-panel">&#128516;</div>')
				$(button).click(function() {
					if ($(".emojis-panel").css("display") === 'none') {
						$(".emojis-panel").css("display", "flex");
						$(".emojis-panel").css("position", "absolute");
						$(".emojis-panel").css("top", $('#message').offset().top - 310);
						$(".emojis-panel").css("left", $('#message').offset().left);
						$(".emojis-panel").show(200);
					} else {
						$(".emojis-panel").hide(200)
					}
				})
				$("#message").focus(function() {
					if ($(".emojis-panel").css("display") != 'none') {
						$(".emojis-panel").hide(200)
					}
				})
				$("#submit").parent().css("display", "flex")
				$("#submit").parent().append(button)
			},
			// 功能配置的html代码
			contentHtml: function() {
				return Utils.createMsgDiv("<h3>表情支持</h3>")
			}
		},
		downloadThreadImages: {
			// 和所属对象属性名保持一致
			id: "downloadThreadImages",
			// 显示在界面上的标题
			title: "一键下载主题图片",
			// 配置变化时是否需要重新加载页面
			needReload: false,
			// 所有用到的配置全部写在这里，config对象会持久化
			// 除 enable 属性外，其他属性要在 configKeyElementMaps 中定义一个同名属性来映射页面元素
			config: {
				enable: false,
				grade: 0
			},
			// 该功能用到的 config 属性名和 元素class/id的映射
			configKeyElementMaps: {
				grade: {
					element: "#grade-input"
				}
			},
			// 功能生效的前提条件检查
			matchCondition: function() {
				return Utils.isMatchPageCategory("thread") && !Utils.hasElement(".package-download-image")
			},
			// 功能生效的逻辑代码
			doAction: function() {
				var grade = this.config.grade
				var title = "打包下载图片"
				var button = $('<button style="margin-left:10px;" class="btn btn-outline-secondary package-download-image">' + title + '</button>')
				button.click(function() {
					$(this).attr("disabled", true);
					if (grade != 0) {
						var jform = $("#reward_form");
						if (jform && jform.attr('action')) {
							$.xpost(jform.attr('action'), "credits1=" + grade);
						}
					}
					var array = [];
					$('.message.break-all').find('img').each(function() {
						let src = $(this).attr("src")
						if (src.indexOf("upload/avatar") == -1 && src.indexOf("view/img/avatar.png") == -1) {
							array.push(src)
						}
					})
					if (array.length == 0) {
						alert("没有图片可供下载!")
						$(this).attr("disabled", false);
						return
					}
					var progress = 0;

					function getBase64Image(images, callback) {
						var img = new Image();
						img.setAttribute("crossOrigin", 'anonymous')
						img.onload = function() {
							var canvas = document.createElement("canvas");
							canvas.width = img.width
							canvas.height = img.height
							canvas.getContext("2d").drawImage(img, 0, 0);
							var dataURL = canvas.toDataURL();
							callback ? callback(dataURL) : null;
						}
						img.src = images;
					}
					var zip = new JSZip()
					var file_name = '图片.zip';
					$(".package-download-image").text("打包进度:(" + progress + "/" + array.length + ")")
					array.forEach(item => {
						getBase64Image(item, function(dataURL) {
							var img_arr = dataURL.split(',');
							let name = progress + "-" + item.substring(item.lastIndexOf("/") + 1)
							zip.file(name, img_arr[1], {
								base64: true
							});
							progress++;
							$(".package-download-image").text("打包进度:(" + progress + "/" + array.length + ")")
							if (Object.keys(zip.files).length == array.length) {
								$(".package-download-image").text("打包完成准备下载")
								zip.generateAsync({
									type: "blob"
								}).then(function(content) {
									$(".package-download-image").attr("disabled", false);
									$(".package-download-image").text(title)
									saveAs(content, file_name);
								});
							}
						})
					})
				})
				$(".plugin.d-flex.justify-content-center.mt-3").append(button)
			},
			// 功能配置的html代码
			contentHtml: function() {
				return Utils.createDivWithTitle("自动打分", `
                            下载的同时自动给楼主帖子打 <input style="width:30px;" type="text" id="grade-input" value="${this.config.grade}" />分(填0或者不填表示不打分)</br>
                        `)
			}
		},
		openPageToNewTab: {
			// 和所属对象属性名保持一致
			id: "openPageToNewTab",
			// 显示在界面上的标题
			title: "新标签页打开帖子",
			// 配置变化时是否需要重新加载页面
			needReload: false,
			// 所有用到的配置全部写在这里，config对象会持久化
			// 除 enable 属性外，其他属性要在 configKeyElementMaps 中定义一个同名属性来映射页面元素
			config: {
				enable: false
			},
			// 该功能用到的 config 属性名和 元素class/id的映射
			configKeyElementMaps: {},
			// 功能生效的前提条件检查
			matchCondition: function() {
				return true
			},
			// 功能生效的逻辑代码
			doAction: function() {
				$('.subject.break-all a').each(function() {
					$(this).attr("target", "_blank")
				})
			},
			// 功能配置的html代码
			contentHtml: function() {
				return Utils.createMsgDiv("<h3>打开帖子时新开一个标签页</h3>")
			}
		},
		onlyViewAuthor: {
			// 和所属对象属性名保持一致
			id: "onlyViewAuthor",
			// 显示在界面上的标题
			title: "只看楼主",
			// 配置变化时是否需要重新加载页面
			needReload: false,
			// 所有用到的配置全部写在这里，config对象会持久化
			// 除 enable 属性外，其他属性要在 configKeyElementMaps 中定义一个同名属性来映射页面元素
			config: {
				enable: false
			},
			// 该功能用到的 config 属性名和 元素class/id的映射
			configKeyElementMaps: {},
			// 功能生效的前提条件检查
			matchCondition: function() {
				return Utils.isMatchPageCategory("thread") && !Utils.hasElement(".only-author-btn")
			},
			// 功能生效的逻辑代码
			doAction: function() {
				let open = "只看楼主"
				let close = "全部显示"
				var button = $('<button style="margin-left:10px;" class="btn btn-outline-secondary only-author-btn">' + open + '</button>')
				button.click(function() {
					if ($(this).text() == open) {
						$(".avatar-3").each(function() {
							let authorId = $("div.media").eq(0).find("a").eq(0).attr("href").replace("user-", "").replace(".htm", "")
							let uid = $(this).parent().attr("href").replace("user-", "").replace(".htm", "")
							if (authorId != uid) {
								$(this).parent().parent().addClass("only-author-btn-mark")
							}
						})
						$(".only-author-btn-mark").hide(100)
						button.text(close)
					} else {
						$(".only-author-btn-mark").show(100)
						$(".only-author-btn-mark").removeClass("only-author-btn-mark")
						button.text(open)
					}
				})
				$(".plugin.d-flex.justify-content-center.mt-3").append(button)
			},
			// 功能配置的html代码
			contentHtml: function() {
				return Utils.createMsgDiv("<h3>打开后帖子里会添加一个“只看楼主”按钮，点击后，当前页面只显示楼主的回复</h3>")
			}
		},
		replyAdditionNumber: {
			// 和所属对象属性名保持一致
			id: "replyAdditionNumber",
			// 显示在界面上的标题
			title: "回复楼层号",
			// 配置变化时是否需要重新加载页面
			needReload: false,
			// 所有用到的配置全部写在这里，config对象会持久化
			// 除 enable 属性外，其他属性要在 configKeyElementMaps 中定义一个同名属性来映射页面元素
			config: {
				enable: false
			},
			// 该功能用到的 config 属性名和 元素class/id的映射
			configKeyElementMaps: {},
			// 功能生效的前提条件检查
			matchCondition: function() {
				return Utils.isMatchPageCategory("thread") && !Utils.hasElement(".bindReplyAdditionNumberEventMark")
			},
			// 功能生效的逻辑代码
			doAction: function() {
				if (Utils.hasElement(".icon-reply")) {
					$(".icon-reply").eq(0).addClass("bindReplyAdditionNumberEventMark")
					$(".icon-reply").click(function() {
						let number = $(this).parent().next().text().trim()
						number = "回复" + number + ": "
						var msg = $("#message").val()
						if (!msg.startsWith(number)) {
							$("#message").val(number + msg)
						}
					})
				}
			},
			// 功能配置的html代码
			contentHtml: function() {
				return Utils.createMsgDiv("<h3>当你回复某一楼层时，回复中会自动附带楼层号码</h3>")
			}
		},
		baiduYunLink: {
			// 和所属对象属性名保持一致
			id: "baiduYunLink",
			// 显示在界面上的标题
			title: "百度云链接增强",
			// 配置变化时是否需要重新加载页面
			needReload: false,
			// 所有用到的配置全部写在这里，config对象会持久化
			// 除 enable 属性外，其他属性要在 configKeyElementMaps 中定义一个同名属性来映射页面元素
			config: {
				enable: false
			},
			// 该功能用到的 config 属性名和 元素class/id的映射
			configKeyElementMaps: {},
			// 功能生效的前提条件检查
			matchCondition: function() {
				return Utils.isMatchPageCategory("thread") && !Utils.hasElement(".parseBaiduYunLinkMark")
			},
			// 功能生效的逻辑代码
			doAction: function() {
				var linkpattern = /https?:\/\/pan\.baidu\.com\/s\/[a-zA-Z0-9?=_-]*/
				$(":contains(https://pan.baidu.com/s/)").filter(function() {
					return $(this).children().length === 0
				}).each(function() {
					let parent = $(this).parent()
					let text = parent.text()
					let url = linkpattern.exec(text)[0]
					let code = ""
					let finalUrl = url

					if (url.indexOf("pwd=") == -1) {
						var codepattern = new RegExp(url + ".*(提取码.*)?([a-zA-Z0-9]{4})");
						let match = codepattern.exec(text)
						if (!match || match.length == 0) {
							// 没有找到本链接对应的提取码，略过处理下一个
							return
						}
						code = match[0]
						code = code.replace(url, "")
						code = /[a-zA-Z0-9]{4}/.exec(code)[0]
						code = code.trim()
						finalUrl = finalUrl + "?pwd=" + code
					} else {
						code = /pwd=[a-zA-Z0-9]{4}/.exec(url)[0].replace("pwd=", "")
					}
					let html = parent.html()
					html = html.replace(new RegExp("链接[：:]?"), "")
					html = html.replace(new RegExp("提取码[:：]?"), "")
					html = html.replace(url, "")
					html = html.replace(code, "")
					html = html.replace(new RegExp("--来自百度网盘超级会员V\\d的分享"), "")
					parent.html(html)

					$('.message.break-all').eq(0).append(Utils.createDivWithTitle("老男人助手解析百度云链接结果", '<a class="baiduYunLink" target="_blank" href="' + finalUrl + '">' + finalUrl + '</a> <i url="' + finalUrl + '" style="font-size: 25px;" class="copy-link fa fa-copy"></i><span style="margin-left:5px;display:none;color:red;">链接已经复制到剪贴板</span>', true, "width:100%;border: 2px solid orange;border-style: dashed;", "background-color:#f8f9fa !important;"))

					$(".alert.alert-success").each(function() {
						if ($(this).text().trim() == "" && !Utils.hasElement("img", this)) {
							$(this).hide()
						}
					})

					$(".copy-link").click(function() {
						let url = $(this).attr("url")
						navigator.clipboard.writeText(url)
						let tip = $(this).next()
						tip.show();
						setTimeout(function() {
							tip.hide();
						}, 500)
					})
				})

				$("body").addClass("parseBaiduYunLinkMark")
			},
			// 功能配置的html代码
			contentHtml: function() {
				return Utils.createMsgDiv("<h3>把百度云链接和提取码组合成一个可直接访问的链接，免去手动输入提取码</h3>")
			}
		},
		quickReply: {
			// 和所属对象属性名保持一致
			id: "quickReply",
			// 显示在界面上的标题
			title: "快速回复",
			// 配置变化时是否需要重新加载页面
			needReload: false,
			// 所有用到的配置全部写在这里，config对象会持久化
			// 除 enable 属性外，其他属性要在 configKeyElementMaps 中定义一个同名属性来映射页面元素
			config: {
				enable: false
			},
			// 该功能用到的 config 属性名和 元素class/id的映射
			configKeyElementMaps: {},
			// 功能生效的前提条件检查
			matchCondition: function() {
				return Utils.isMatchPageCategory("my-notice") && !Utils.hasElement(".quickReplyMark")
			},
			// 功能生效的逻辑代码
			doAction: function() {
				$(".single-comment").each(function(){
					let href = $(this).find("a").eq(0).attr("href")
					let ret = Utils.parsePageIdAndQuoteId(href)
					if(!ret){
						return
					}
					let button = $('<div class="quick-reply-button" pageId="'+ret.pageId+'" quoteId="'+ret.quoteId+'">回复</div>')
					button.click(function(){
						let pageId = $(this).attr("pageId")
						let quoteId = $(this).attr("quoteId")
						let msg = prompt("输入回复内容")
						if(msg && msg.trim().length > 0){
							Utils.quickReply(pageId,quoteId,msg)
						}
					})
					$(this).parent().append(button)
				})
				$("body").addClass("quickReplyMark")
			},
			// 功能配置的html代码
			contentHtml: function() {
				return Utils.createMsgDiv("<h3></h3>")
			}
		}
	}
	// 所有的工具函数都放在这里
	var Utils = {
		configPrefix: "OldManHelperConfig",
		BLACK_TYPE_ALL: "全部",
		BLACK_TYPE_THREAD: "帖子",
		BLACK_TYPE_REPLY: "回复",
		//工具用到的所有css样式都定义在这里
		styles: `
                <style>
                    #setting_btn {
                        top: calc(75vh) !important;
                        left: 0 !important;
                        width: 32px;
                        height: 32px;
                        padding: 6px !important;
                        display: flex;
                        position: fixed !important;
                        opacity: 0.5;
                        transition: .2s;
                        z-index: 9999 !important;
                        cursor: pointer;
                        user-select: none !important;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        box-sizing: content-box;
                        border-radius: 0 50% 50% 0;
                        transform-origin: center !important;
                        transform: translateX(-8px);
                        background-color: #eee;
                        -webkit-tap-highlight-color: transparent;
                        box-shadow: 1px 1px 3px 0px #aaa !important;
                        color: #000 !important;
                        font-size: medium;
                    }
                    #Autopage_number:hover {
                        opacity: 0.9;
                        transform: translateX(0);
                    }
                    .setting-textarea {
                        width: 280px;
                        height: 200px;
                    }
                    #user-operate-menu {
                        display:none;
                        max-width:70px;
                        display:flex;
                        flex-direction:column;
                    }
                    .setting-item {
                        width: 100%;
                        height:30px;
                        max-width: 240px;
                        display: flex;
                        flex-direction: row;
                        justify-content: center;
                        align-items: center;
                        background-color: white !important;
                    }
                    .setting-block {
                        height:400px;
                        overflow-y:auto;            
                        border-width: 1px;
                        border-color: orange !important;
                    }
                    .setting-block::-webkit-scrollbar {
                        display:none;
                    }
                    .setting-item-list {
                        width: 240px;
                        border-radius: 15px 0px 0px 15px;
                    }
                    .setting-item-content {
                        width: 360px;
                        border-radius: 0px 15px 15px 0px;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                    }
                    .split-line {
                        width: 100%;
                        height: 1px;
                        background-color: #ededed !important;
                    }
                    .select-item {
                        background-color: #e4e3e8 !important;
                    }

                    .ios-theme-switch-div{
                        position:relative;
                        width: 40px;
                        height: 24px;
                    }
                    .ios-theme-switch-div input.theHelper{
                        display:none;
                    }
                    .ios-theme-switch-div label{
                        position:relative;
                        display: block;
                        padding: 1px;
                        border-radius: 24px;
                        height: 22px;
                        background-color: #eee !important;
                        cursor: pointer;
                        vertical-align: top;
                        -webkit-user-select: none;
                        -webkit-transition: all 0.3s ease;
                    }
                    .ios-theme-switch-div label:before{
                        content: '';
                        display: block;
                        border-radius: 24px;
                        height: 22px;
                        background-color: white !important;
                        -webkit-transform: scale(1, 1);
                        -webkit-transition: all 0.3s ease;
                    }
                    .ios-theme-switch-div label:after{
                        content: '';
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        width: 22px;
                        height: 22px;
                        margin-top: -11px;
                        margin-left: -11px;
                        display: block;
                        border-radius: 100%;
                        background-color: white !important;
                        box-shadow: 1px 1px 1px 1px rgba(0,0,0,0.08);
                        -webkit-transform: translateX(-9px);
                        -webkit-transition: all 0.3s ease;
                    }
                    input.theHelper:checked~label:after{
                        -webkit-transform: translateX(9px);
                    }
                    input.theHelper:checked~label:before{
                        background-color:#4cda64 !important;
                    }
                    .content {
                        width: 90%;
                        height: 350px;
                        /*border:2px solid #ffffff;
                        border-style: dashed;
                        border-radius: 5px;*/
                        overflow-y:auto;
                        padding: 10px;          
                    }
                    .content::-webkit-scrollbar {
                        display:none;
                    }
                    #setting-panel {
                        margin-top:10px;
                        width: 600px;
                        height: 400px;
                        border-radius: 15px;
                        background-color:#f1f0f5 !important;
                        display: none;
                        flex-direction: row;
                        border:1px solid #ddd;
                        z-index:999;
                        box-shadow:0 0 10px #eee;
                    }
                    #overlay-panel {
                        display:none;
                        position:fixed;
                        top:0;
                        right:0;
                        bottom:0;
                        left:0;
                        z-index:5;
                        background-color:rgba(0,0,0,.4) !important;
                        transition:all .3s;
                        opacity:0.5
                    }
                    .setting-item-section{
                        border:2px solid white;
                        border-style: dashed;
                        width: 305px;
                        border-radius: 5px;
                        margin-bottom:20px;
                    }
                    .setting-item-section-title {
                        margin-left: 10px;
                        margin-top: -10px;
                        height: 20px;
                        line-height: 20px;
                        font-size: 15px;
                    }
                    .setting-item-section-title span{
                        background-color: #f1f0f5 !important;
                    }
                    .section-content {
                        word-wrap: break-word;
                        word-break: break-all;
                        overflow: hidden;
                        padding-left: 10px;
                        padding-right: 10px;
                        padding-bottom: 10px;
                    }
                    .setting-item-desc-text {
                        color: #787878 !important;
                    }
                    .black-type-button {
                        font-size:10px;
                    }
                    .emoji-item {
                        width: 40px;
                        height: 40px;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        cursor: default;
                        font-size: 20px;
                    }

                    .emojis-panel {
                        display: none;
                        height: 300px;
                        width: 300px;
                        overflow: auto;
                        background: #EEEEEE !important;
                        flex-direction: row;
                        flex-wrap: wrap;
                    }

                    .emojis::-webkit-scrollbar {
                        display: none;
                    }
                    .open-emoji-panel {
                        cursor:default;
                        display:flex;
                        justify-content:center;
                        align-items:center;
                        margin-left:5px;
                        width: 28px;
                        height: 28px;
                        font-size: 20px;
                    }
                    .msg-div {
                        width:100%;
                        height:100%;
                        display:flex;
                        justify-content:center;
                        align-items:center;
                    }
                    .quick-reply-button {
                    	width:40px;
                    	height:20px;
                    	border-radius:5px;
                    	color:white;
                    	background-color:#177f2e;
                    	display:flex;
                    	justify-content:center;
                    	align-items:center;
                    	font-size: 10px;
                    }                    
                </style>
            `,
		//设置按钮的html定义
		settingButtonHtml: `
              <div id="setting_btn">
               <svg role="img" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewbox="0 0 24 24" aria-labelledby="toolIconTitle">
                <path d="M9.74292939,13.7429294 C9.19135019,13.9101088 8.60617271,14 8,14 C4.6862915,14 2,11.3137085 2,8 C2,7.07370693 2.20990431,6.19643964 2.58474197,5.4131691 L6.94974747,9.77817459 L9.77817459,6.94974747 L5.4131691,2.58474197 C6.19643964,2.20990431 7.07370693,2 8,2 C11.3137085,2 14,4.6862915 14,8 C14,8.88040772 13.8103765,9.71652648 13.4697429,10.4697429 L20.5858636,17.5858636 C21.3669122,18.3669122 21.3669122,19.6332422 20.5858636,20.4142907 L19.9142907,21.0858636 C19.1332422,21.8669122 17.8669122,21.8669122 17.0858636,21.0858636 L9.74292939,13.7429294 Z"></path>
               </svg>
              </div> 
              <div id="user-operate-menu"></div>
            `,
		// 插件初始化
		init: function() {
			//加载配置
			this.loadConfig()
			//创建设置按钮以及加载css
			document.documentElement.insertAdjacentHTML('beforeend', this.styles + this.settingButtonHtml);
			//创建设置面板
			$('body').append(this.createSettingPanel(true))
			//绑定背景层事件
			$("#overlay-panel").click(function() {
				$("#setting-panel").hide(200)
				$("#overlay-panel").hide()
				Utils.saveConfig(window.currentFunctionKey)
				Utils.reloadPage(window.currentFunctionKey)
			})
			//创建功能列表
			this.createSettingItems(settingObject)
			//绑定设置按钮点击事件，点击后隐藏/显示设置面板
			window.openOldManHelper = function() {
				let settingPanel = $("#setting-panel");
				let overlayPanel = $("#overlay-panel");
				if (settingPanel.css("display") === 'none') {
					Utils.setCurrentContentHtml(Utils.getCurrentFunctionObject())
					var d = document.documentElement
					settingPanel.css("display", "flex");
					settingPanel.css("position", "absolute");
					settingPanel.css("top", d.scrollTop + (d.clientHeight - 400) / 2);
					settingPanel.css("left", d.scrollLeft + (d.clientWidth - 600) / 2);
					settingPanel.show(200);
					overlayPanel.show()
				} else {
					settingPanel.hide(200)
					overlayPanel.hide()
					Utils.saveConfig(window.currentFunctionKey)
					Utils.reloadPage(window.currentFunctionKey)
				}
			}
			$("#setting_btn").click(function() {
				window.openOldManHelper()
			})
			$('body').mousemove(function(e) {
				e = e || window.event;
				window.__xx = e.pageX || e.clientX + document.body.scroolLeft;
				window.__yy = e.pageY || e.clientY + document.body.scrollTop;
			});

			this.applyFunction()
		},
		saveConfig: function(functionKey) {
			if (!functionKey || !settingObject[functionKey]) {
				return
			}
			let functionObject = settingObject[functionKey]
			var config = {}
			// 如果设置页面处于显示状态，需要从设置页面读取值更新内存，最后再持久化存储
			// 如果设置页面没有显示，略过从设置页面读取值更新内存这一步，直接将内存配置持久化存储
			if (this.isSettingPanelShow()) {
				for (let configName of Object.keys(functionObject.config)) {
					let val = null
					//功能开关统一处理
					if (configName == "enable") {
						val = document.getElementById('switch-' + functionKey).checked
					} else {
						//拿到属性key的映射对象
						let mapObject = functionObject.configKeyElementMaps[configName]
						// 如果映射对象有getVal函数，那么就调用getVal函数取得值，如果没有，就默认调用 getElementVal 函数取值
						val = mapObject.getVal ? mapObject.getVal() : this.getElementVal(mapObject.element)
					}
					functionObject.config[configName] = val
					config[configName] = val
				}
			} else {
				config = functionObject.config
			}
			//将window.Config对象数据保存到localStorage
			localStorage.setItem(this.configPrefix + "__" + functionKey, JSON.stringify(config));

			this.applyFunction(functionKey)
		},
		loadConfig: function() {
			for (let functionName of Object.keys(settingObject)) {
				let item = settingObject[functionName]
				let c = localStorage.getItem(this.configPrefix + "__" + functionName)
				if (!c) {
					console.log("加载[" + item.title + "]功能配置出错:未找到配置！将使用默认配置。")
					continue;
				}
				try {
					let cobj = JSON.parse(c)
					for (let key of Object.keys(cobj)) {
						item.config[key] = cobj[key]
					}
				} catch (e) {
					console.log("加载[" + item.title + "]功能配置出错:json解析错误！将使用默认配置。" + e.toString())
				}
			}
		},
		parsePageIdAndQuoteId:function(href){
			var tmp = href.replace("thread-","")
			tmp = tmp.substring(0,tmp.lastIndexOf("."))
			return {
				pageId:tmp,
				quoteId:href.split("#")[1]
			}
		},
		quickReply: function(pageId,quoteId,content) {
			var form = this.createQuickReplyForm(pageId,quoteId,content,true)
			form.trigger('submit');
		},
		getCurrentPageThreadId:function(){
			return window.location.href.split("-")[1].replace(".htm","")
		},
		hasElement: function(el, root = null) {
			return root ? $(root).find(el).length > 0 : $(el).length > 0
		},
		getCurrentFunctionObject: function() {
			if (!window.currentFunctionKey) {
				return null;
			}
			let object = settingObject[window.currentFunctionKey]
			return object ? object : null;
		},
		isSettingPanelShow: function() {
			return $("#setting-panel").css("display") != 'none'
		},
		reloadPage: function(functionKey) {
			if (!functionKey || !settingObject[functionKey]) {
				return
			}
			let functionObject = settingObject[functionKey]
			if (functionObject.needReload) {
				window.location.reload();
			}
		},
		loadJSColor: function() {
			var input = $("[data-jscolor]");
			for (var i = 0; i < input.length; i++) {
				var picker = new jscolor(input[i]);
				picker.hash = true;
			}
			jscolor.init();
		},
		// 判断页面地址是否有指定前缀
		isMatchPageCategory: function(pagePrefix) {
			return window.location.href.startsWith(window.location.protocol + "//" + window.location.host + "/" + pagePrefix)
		},
		// 判断当前页面是否为主页
		isIndexPage: function() {
			return window.location.href == 'https://bbs.oldmanemu.net/'
		},
		getElementVal(idOrClass) {
			return $(idOrClass).val()
		},
		applyFunction: function(functionName = "") {
			let applyFn = function(fn) {
				if (fn && fn.config && fn.config.enable && fn.doAction) {
					if (!fn.matchCondition || (fn.matchCondition && fn.matchCondition())) {
						fn.doAction();
					}
				}
			}
			if (functionName == "") {
				for (let functionName of Object.keys(settingObject)) {
					applyFn(settingObject[functionName])
				}
			} else {
				applyFn(settingObject[functionName])
			}
		},
		// 创建开关按钮
		createIosThemeSwitch: function(item, jqueryObject = false) {
			let checked = function(item) {
				return item.config.enable ? 'checked="checked"' : ''
			}
			let html = `
                      <div class="ios-theme-switch-div">
                        <input id="switch-${item.id}" type="checkbox" ${checked(item)} class="theHelper" />
                        <label for="switch-${item.id}"></label>
                      </div>
                `
			return jqueryObject ? $(html) : html
		},
		//创建功能div
		createSettingItem: function(functionKey, item, jqueryObject = false) {
			let html = `
                    <div class="setting-item" functionKey="${functionKey}">
                        <div style="flex-grow: 6;display: flex;margin-left:10px; align-items: center;max-width: 170px;">
                            ${item.title}
                        </div>
                        <div style="flex-grow: 2;display: flex;justify-content: center;align-items: center;max-width: 50px;">
                            ${this.createIosThemeSwitch(item)}
                        </div>
                    </div>
                `
			return jqueryObject ? $(html) : html
		},
		//创建设置面板
		createSettingPanel: function(jqueryObject = false) {
			let html = `
                    <div id="setting-panel">
                        <div class="setting-block setting-item-list"></div>
                        <div class="setting-block setting-item-content">
                            <div class="content">
                                ${this.createDefaultContentHtml()}
                            </div>
                        </div>
                    </div>
                    <div id="overlay-panel"></div>
                `
			return jqueryObject ? $(html) : html
		},
		createQuickReplyForm: function(pageId,quoteId,content,jqueryObject = false) {
			let html = `
                    <form style="display:none;" action="post-create-${pageId}-1.htm" method="post"> 
					    <input type="hidden" name="doctype" value="1">
					    <input type="hidden" name="return_html" value="1">
					    <input type="hidden" name="quotepid" value="${quoteId}">    
					    <textarea name="message">${content}</textarea>
					</form>
                `
			return jqueryObject ? $(html) : html
		},
		setCurrentContentHtml: function(functionObject, ifFnIsNullUseDefault = true) {
			$(".content").html(functionObject && functionObject.contentHtml ? functionObject.contentHtml() : ifFnIsNullUseDefault ? this.createDefaultContentHtml() : "")
			Utils.loadJSColor()
		},
		// 创建功能列表
		createSettingItems: function(settingObject) {
			var list = $(".setting-item-list")
			let index = 0;
			let lastIndex = Object.keys(settingObject).length - 1
			for (let functionName of Object.keys(settingObject)) {
				let item = settingObject[functionName]
				let setting = this.createSettingItem(functionName, item, true)
				setting.click(function() {
					window.lastFunctionKey = window.currentFunctionKey
					window.currentFunctionKey = $(this).attr("functionKey")
					Utils.saveConfig(window.lastFunctionKey)
					$(".setting-item").removeClass("select-item")
					$(this).addClass("select-item")
					Utils.setCurrentContentHtml(item)
				})
				list.append(setting)
				if (index != lastIndex) {
					list.append($('<div class="split-line" />'))
				}
			}
		},
		createDivWithTitle: function(title, contentHtml, jqueryObject = false, styles = "", titleStyles = "") {
			let html = `
                    <div class="setting-item-section" style="${styles}">
                        <h1 class="setting-item-section-title"><span style="${titleStyles}">${title}</span></h1>
                        <div class="section-content">
                            ${contentHtml}
                        </div>
                    </div>
                `
			return jqueryObject ? $(html) : html
		},
		createDefaultContentHtml: function(jqueryObject = false) {
			let html = `
                    <span style="font-size:30px;">老男人助手</span><span style="font-size:15px;">by rock</span>   </br>                 
                    <p>有任何bug反馈或者功能建议，请在论坛回复<a href="https://bbs.oldmanemu.net/thread-13819.htm">我的帖子</a>，或者发送邮件给我 1099607871@qq.com</p>
                    <p>感谢使用</p>
                `
			return jqueryObject ? $(html) : html
		},
		createBlackTypeButton: function(banType, userId, username, text, jqueryObject = false) {
			let html = `
                    <button class='black-type-button' banType='${banType}' user-id='${userId}' user-name='${username}'>${text}</button>
                `
			return jqueryObject ? $(html) : html
		},
		createMsgDiv: function(msgHtml, jqueryObject = false) {
			let html = `
                    <div class="msg-div">
                        ${msgHtml}
                    <div>
                `
			return jqueryObject ? $(html) : html
		}
	}


	$(document).ready(function() {
		Utils.init()
	});

})();