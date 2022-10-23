/// <reference path="../../typings/index.d.ts" />
game.import("extension", function (lib, game, ui, get, ai, _status) {
  var dynamicTranslate = {
    furrykill_qianlie: function (player) {
      if (player.storage.furrykill_qianlie == true)
        return '转换技，阳：以你为目标的锦囊牌结算完毕后，可以使用一张杀或伤害锦囊牌。<span class="bluetext">阴：你造成的伤害结算完毕后，可以发现一张牌，若此时是你的出牌阶段，你跳过本回合的弃牌阶段，并且本阶段你不能再使用牌。</span>';
      return '转换技，<span class="bluetext">阳：以你为目标的锦囊牌结算完毕后，可以使用一张杀或伤害锦囊牌。</span>阴：你造成的伤害结算完毕后，可以发现一张牌，若此时是你的出牌阶段，你跳过本回合的弃牌阶段，并且本阶段你不能再使用牌。';
    },
    furrykill_chengming: function (player) {
      if (player.storage.furrykill_chengming == true)
        return '转换技，锁定技，阳：你的暗置牌因弃置进入弃牌堆后，你摸一张牌。<span class="bluetext">阴：你使用明置的牌后，摸一张牌。</span>';
      return '转换技，锁定技，<span class="bluetext">阳：你的暗置牌因弃置进入弃牌堆后，你摸一张牌。</span>阴：你使用明置的牌后，摸一张牌。';
    },
    furrykill_sanyuan: function (player) {
      if (player.storage.furrykill_sanyuan == 1)
        return '吟唱，转换技，其他角色的准备阶段，你可以<span class="bluetext">① ：视为对其使用一张铁索连环并对其造成一点火焰伤害；</span>② ：获得其装备区里的一张牌并使用之；③ ：视为对其使用一张杀，若此杀造成伤害，你恢复一点体力。';
      if (player.storage.furrykill_sanyuan == 2)
        return '吟唱，转换技，其他角色的准备阶段，你可以① ：视为对其使用一张铁索连环并对其造成一点火焰伤害；<span class="bluetext">② ：获得其装备区里的一张牌并使用之；</span>③ ：视为对其使用一张杀，若此杀造成伤害，你恢复一点体力。';
      return '吟唱，转换技，其他角色的准备阶段，你可以① ：视为对其使用一张铁索连环并对其造成一点火焰伤害；② ：获得其装备区里的一张牌并使用之；<span class="bluetext">③ ：视为对其使用一张杀，若此杀造成伤害，你恢复一点体力。</span>';
    },
    furrykill_suqing: function (player) {
      if (player.storage.furrykill_suqing) return '出牌阶段开始时，你可以选择一名角色，弃置其每个区域内的一张牌。此阶段结束时，若你未对其造成伤害，你失去一点体力。';
      return '锁定技，出牌阶段开始时，你选择一名体力值不大于你的角色，然后弃置其每个区域内的一张牌。此回合结束时，若你未对其造成伤害，你失去一点体力。';
    },
  }
  return {
    name: "FurryKill", editable: false, content: function (config, pack) {
      var f = function (英文名) { if (config[英文名]) { for (var i in lib.characterPack[英文名]) { if (lib.character[i][4].indexOf("forbidai") < 0) lib.character[i][4].push("forbidai"); } } };
      f("FurryKill");
    }, precontent: function (qs) {
      if (qs.enable) {

        //#region 扩展

        lib.skill.furrykill_cardUseLimit = {
          marktext: '⏳',
          intro: {
            markcount: function (storage) {
              if (storage) return storage[1] + "/" + storage[0];
              return 0;
            },
            content: function (storage) {
              return '<div class="text center">已经使用了' + storage[1] + '张牌</br>一共能使用' + storage[0] + '张牌</div>'
            }
          },
        }
        lib.translate.furrykill_cardUseLimit = '卡牌使用限制';

        lib.element.content.furrykillDiscoverCard = function () {
          "step 0";
          if (event.gotoOrdering) game.cardsGotoOrdering(event.cards);
          event.videoId = lib.status.videoId++;
          event.time = get.utc();
          "step 1";
          event.target.chooseButton([event.prompt, event.cards], event.selectButton, event.forced)
            .set('filterButton', event.filterButton)
            .set('ai', event.ai)
            .set('cards', event.cards);
          "step 2";
          event.result = result;
          var time = 1000 - (get.utc() - event.time);
          if (time > 0) {
            game.delay(0, time);
          }
          if (result.bool && result.links) {
            event.card = result.links[0];
            event.result.card = event.card;
          } else {
            event.finish();
          }
          "step 3";
          event.target.gain(event.card, "draw");
        }

        lib.element.player.furrykillDiscoverCard = function () {
          var next = game.createEvent('furrykillDiscoverCard');
          next.player = this;
          for (var i = 0; i < arguments.length; i++) {
            if (get.itemtype(arguments[i]) == 'player') {
              next.target = arguments[i];
            }
            else if (get.itemtype(arguments[i]) == 'cards') {
              next.cards = arguments[i];
            }
            else if (typeof arguments[i] == 'boolean') {
              next.forced = arguments[i];
            }
            else if (typeof arguments[i] == 'function') {
              if (next.ai) next.filterButton = arguments[i];
              else next.ai = arguments[i];
            }
            else if (get.itemtype(arguments[i]) == 'select') {
              next.selectButton = arguments[i];
            }
            else if (typeof arguments[i] == 'number') {
              next.selectButton = [arguments[i], arguments[i]];
            }
            else if (typeof arguments[i] == 'string') {
              if (next.prompt) {
                next.str = arguments[i];
              } else {
                next.prompt = arguments[i];
              }
            }
          }
          next.player = this;
          if (typeof next.forced != 'boolean') next.forced = false;
          if (next.target == undefined) next.target = this;
          if (next.filterButton == undefined) next.filterButton = function (button) {
            return ui.selected.buttons.length == 0;
          };
          if (next.selectButton == undefined) next.selectButton = [1, 1];
          if (next.ai == undefined) next.ai = function (button) {
            var val = get.buttonValue(button);
            if (get.attitude(_status.event.player, get.owner(button.link)) > 0) return -val;
            return val;
          };
          if (next.gotoOrdering == undefined) next.gotoOrdering = false;
          next.setContent('furrykillDiscoverCard');
          next._args = Array.from(arguments);
          return next;
        }

        lib.element.player.countDifferentCard = function (position) {
          var cards = this.getCards(position);
          var count = 0;
          var hasBasic = false, hasTrick = false, hasEquip = false;
          for (let i = 0; i < cards.length; i++) {
            var type = get.type(cards[i]);
            if (type == 'basic') {
              hasBasic = true;
            } else if (type == 'equip') {
              hasEquip = true;
            } else {
              hasTrick = true;
            }
            if (hasBasic && hasTrick && hasEquip) break;
          }
          if (hasBasic) count++;
          if (hasEquip) count++;
          if (hasTrick) count++;
          return count;
        }

        lib.filter.filterDifferentTypes = function (card) {
          var cards = ui.selected.cards;
          var length = cards.length;
          var allow = ['basic', 'trick', 'equip'];
          if (length > 0) allow.remove(get.type(cards[0], 'trick'));
          if (length > 1) allow.remove(get.type(cards[1], 'trick'));
          return allow.contains(get.type(card, 'trick'));
        }

        lib.skill.mingzhi = {
          intro: {
            content: 'cards',
          },
        };
        lib.translate.mingzhi = '明置';

        lib.element.content.mingzhiCard = function () {
          "step 0"
          event.result = {};
          if (get.itemtype(cards) != 'cards') {
            event.result.bool = false;
            event.finish();
            return;
          }
          if (!event.str) {
            event.str = get.translation(player.name) + '明置了手牌';
          }
          event.dialog = ui.create.dialog(event.str, cards);
          event.dialogid = lib.status.videoId++;
          event.dialog.videoId = event.dialogid;

          if (event.hiddencards) {
            for (var i = 0; i < event.dialog.buttons.length; i++) {
              if (event.hiddencards.contains(event.dialog.buttons[i].link)) {
                event.dialog.buttons[i].className = 'button card';
                event.dialog.buttons[i].innerHTML = '';
              }
            }
          }
          game.broadcast(function (str, cards, cards2, id) {
            var dialog = ui.create.dialog(str, cards);
            dialog.videoId = id;
            if (cards2) {
              for (var i = 0; i < dialog.buttons.length; i++) {
                if (cards2.contains(dialog.buttons[i].link)) {
                  dialog.buttons[i].className = 'button card';
                  dialog.buttons[i].innerHTML = '';
                }
              }
            }
          }, event.str, cards, event.hiddencards, event.dialogid);
          if (event.hiddencards) {
            var cards2 = cards.slice(0);
            for (var i = 0; i < event.hiddencards.length; i++) {
              cards2.remove(event.hiddencards[i]);
            }
            game.log(player, '明置了', cards2);
          }
          else {
            game.log(player, '明置了', cards);
          }
          game.delayx(2);
          game.addVideo('showCards', player, [event.str, get.cardsInfo(cards)]);
          "step 1"
          game.broadcast('closeDialog', event.dialogid);
          event.dialog.close();

          if (!player.storage.mingzhi) player.storage.mingzhi = cards;
          else player.storage.mingzhi = player.storage.mingzhi.concat(cards);
          player.markSkill('mingzhi');
          event.result.bool = true;
          event.result.cards = cards;
        }

        lib.element.content.chooseCardToMingzhi = function () {
          "step 0"
          var next = player.chooseCard(event.selectCard, event.forced,
            event.prompt, 'h', event.ai);
          next.set("filterCard", event.filterCard);
          "step 1"
          if (result && result.bool && result.cards) {
            let str = event.str ? event.str : "";
            player.mingzhiCard(result.cards, str);
          }

          event.result = result;
        }

        lib.element.content.chooseMingzhiCard = function () {
          "step 0"
          if (!player.storage.mingzhi || !player.storage.mingzhi.length) {
            event.finish();
            return;
          }

          var next = player.choosePlayerCard(event.selectButton, event.forced,
            event.prompt, 'h', event.ai);
          next.set("filterButton", event.filterButton);
          "step 1"
          if (result && result.bool && result.cards) {
            let str = event.str ? event.str : "";
            player.mingzhiCard(result.cards, str);
          }

          event.result = result;
        }

        lib.element.content.removeMingzhiCard = function () {
          event.result = {};
          if (get.itemtype(cards) != 'cards') {
            event.finish();
            event.result.bool = false;
            return;
          }
          if (!player.storage.mingzhi || !player.storage.mingzhi.length) {
            event.result.bool = false;
            event.finish();
            return;
          }
          game.log(player, '暗置了', cards);
          player.storage.mingzhi.removeArray(event.cards);
          if (player.storage.mingzhi.length) {
            player.syncStorage("mingzhi");
            player.markSkill('mingzhi');
          } else {
            delete player.storage.mingzhi;
            player.unmarkSkill('mingzhi');
          }
          event.result.bool = true;
          event.result.cards = event.cards;
        }

        lib.element.content.chooseRemoveMingzhiCard = function () {
          "step 0"
          if (!player.storage.mingzhi || !player.storage.mingzhi.length) {
            event.finish();
            return;
          }
          var next = player.choosePlayerCard(event.target, event.selectButton,
            event.forced, event.prompt, 'h', event.ai);
          next.set("filterButton", event.filterButton);
          "step 1"
          if (result && result.bool && result.links) {
            player.removeMingzhiCard(result.links);
          }

          result.cards = result.links;
          event._result = result;
        }

        lib.filter.filterMingzhiCard = function (player, card) {
          return player.storage.mingzhi && player.storage.mingzhi.contains(card);
        }

        lib.element.player.countMingzhiCard = function () {
          if (!this.storage.mingzhi) return 0;
          return this.storage.mingzhi.length;
        }

        lib.element.player.getMingzhiCard = function () {
          var getCards = [];
          if (this.storage.mingzhi && this.storage.mingzhi.length) {
            getCards = this.storage.mingzhi.concat();
          }
          return getCards;
        }

        lib.element.player.mingzhiCard = function (cards, str) {
          var next = game.createEvent('mingzhiCard');
          next.player = this;
          next.str = str;

          if (typeof cards == 'string') {
            str = cards;
            cards = next.str;
            next.str = str;
          }

          if (get.itemtype(cards) == 'card') next.cards = [cards];
          else if (get.itemtype(cards) == 'cards') next.cards = cards;

          var mingzhiCards = this.getMingzhiCard();
          for (var i = next.cards.length - 1; i >= 0; i--) {
            if (mingzhiCards.contains(next.cards[i])) {
              next.cards.splice(i, 1);
            }
          }

          next.setContent('mingzhiCard');
          if (!Array.isArray(next.cards) || !next.cards.length) {
            _status.event.next.remove(next);
          }
          next._args = Array.from(arguments);
          return next;
        }

        lib.element.player.chooseCardToMingzhi = function () {
          var next = game.createEvent('chooseCardToMingzhi');
          next.player = this;
          for (var i = 0; i < arguments.length; i++) {
            if (get.itemtype(arguments[i]) == 'player') {
              next.target = arguments[i];
            }
            else if (typeof arguments[i] == 'number') {
              next.selectCard = [arguments[i], arguments[i]];
            }
            else if (get.itemtype(arguments[i]) == 'select') {
              next.selectCard = arguments[i];
            }
            else if (typeof arguments[i] == 'boolean') {
              next.forced = arguments[i];
            }
            else if (typeof arguments[i] == 'function') {
              next.ai = arguments[i];
            }
            else if (typeof arguments[i] == 'string') {
              if (next.prompt) {
                next.str = arguments[i];
              } else {
                next.prompt = arguments[i];
              }
            }
          }
          next.filterCard = function (card, player) {
            return !lib.filter.filterMingzhiCard(player, card);
          };
          if (next.target == undefined) next.target = this;
          if (next.selectCard == undefined) next.selectCard = [1, 1];
          if (next.ai == undefined) next.ai = function (card) {
            if (_status.event.att) {
              return 11 - get.value(card);
            }
            return 0;
          };
          next.setContent('chooseCardToMingzhi');
          next._args = Array.from(arguments);
          if (next.player.countCards('h') == next.player.countMingzhiCard()) {
            _status.event.next.remove(next);
          }
          return next;
        }

        lib.element.player.chooseMingzhiCard = function () {
          var next = game.createEvent('chooseMingzhiCard');
          next.player = this;
          for (var i = 0; i < arguments.length; i++) {
            if (get.itemtype(arguments[i]) == 'player') {
              next.target = arguments[i];
            }
            else if (typeof arguments[i] == 'number') {
              next.selectButton = [arguments[i], arguments[i]];
            }
            else if (get.itemtype(arguments[i]) == 'select') {
              next.selectButton = arguments[i];
            }
            else if (typeof arguments[i] == 'boolean') {
              next.forced = arguments[i];
            }
            else if (typeof arguments[i] == 'function') {
              next.ai = arguments[i];
            }
            else if (typeof arguments[i] == 'string') {
              if (next.prompt) {
                next.str = arguments[i];
              } else {
                next.prompt = arguments[i];
              }
            }
          }
          next.filterButton = function (button, player) {
            return !lib.filter.filterMingzhiCard(player, button.link);
          };
          if (next.target == undefined) next.target = this;
          if (next.selectButton == undefined) next.selectButton = [1, 1];
          if (next.ai == undefined) next.ai = function (button) {
            var val = get.buttonValue(button);
            if (get.attitude(_status.event.player, get.owner(button.link)) > 0) return -val;
            return val;
          };
          next.setContent('chooseMingzhiCard');
          next._args = Array.from(arguments);
          if (next.player.countCards('h', function (card) {
            return !lib.filter.filterMingzhiCard(next.player, card);
          })) {
            _status.event.next.remove(next);
          }
          return next;
        }

        lib.element.player.removeMingzhiCard = function (cards) {
          var next = game.createEvent('removeMingzhiCard');
          next.player = this;
          if (get.itemtype(cards) == 'card') next.cards = [cards];
          else if (get.itemtype(cards) == 'cards') next.cards = cards;

          let mingzhiCards = this.getMingzhiCard();
          for (let i = next.cards.length - 1; i >= 0; i--) {
            const element = next.cards[i];
            if (!mingzhiCards.contains(element)) {
              next.cards.splice(i, 1);
            }
          }
          next.setContent('removeMingzhiCard');
          if (!Array.isArray(next.cards) || !next.cards.length) {
            _status.event.next.remove(next);
          }
          next._args = Array.from(arguments);
          return next;
        }

        lib.element.player.chooseRemoveMingzhiCard = function () {
          var next = game.createEvent('chooseRemoveMingzhiCard');
          next.player = this;
          for (var i = 0; i < arguments.length; i++) {
            if (get.itemtype(arguments[i]) == 'player') {
              next.target = arguments[i];
            }
            else if (typeof arguments[i] == 'number') {
              next.selectButton = [arguments[i], arguments[i]];
            }
            else if (get.itemtype(arguments[i]) == 'select') {
              next.selectButton = arguments[i];
            }
            else if (typeof arguments[i] == 'boolean') {
              next.forced = arguments[i];
            }
            else if (typeof arguments[i] == 'function') {
              if (next.ai) next.filterButton = arguments[i];
              else next.ai = arguments[i];
            }
            else if (typeof arguments[i] == 'object' && arguments[i]) {
              next.filterButton = function (button, player) {
                return get.filter(arguments[i])(button.link);
              };
            }
            else if (typeof arguments[i] == 'string') {
              next.prompt = arguments[i];
            }
          }
          if (next.filterButton == undefined) next.filterButton = lib.filter.all;

          next.filterButton = function (button, player) {
            const func = next.filterButton;
            return lib.filter.filterMingzhiCard(player, button.link)
              && func(button, player);
          }
          if (next.target == undefined) next.target = this;
          if (next.selectButton == undefined) next.selectButton = [1, 1];
          if (next.ai == undefined) next.ai = function (button) {
            var val = get.buttonValue(button);
            if (get.attitude(_status.event.player, get.owner(button.link)) > 0) return -val;
            return val;
          };
          next.setContent('chooseRemoveMingzhiCard');
          next._args = Array.from(arguments);
          if (next.player.countCards('h', function (card) {
            return lib.filter.filterMingzhiCard(next.player, card);
          })) {
            _status.event.next.remove(next);
          }
          return next;
        }

        lib.skill._loseMingzhi = {
          trigger: {
            global: "loseEnd"
          },
          forced: true,
          priority: 101,
          popup: false,
          forceDie: true,
          filter: function (event, player) {
            if (player.storage.mingzhi && player.storage.mingzhi.length) {
              return true;
            }
          },
          content: function () {
            event.cards = trigger.cards;
            let mingzhiCard = [];
            for (var i = 0; i < event.cards.length; i++) {
              if (player.storage.mingzhi && player.storage.mingzhi.contains(event.cards[i])) {
                if (player.storage.mingzhi.length == 1) {
                  delete player.storage.mingzhi;
                  player.unmarkSkill('mingzhi');
                } else {
                  player.storage.mingzhi.remove(event.cards[i]);
                  player.syncStorage('mingzhi');
                }
                mingzhiCard.push(event.cards[i]);
              }
            }
            event.oCards = mingzhiCard;
            if (event.oCards.length) {
              event.source = trigger.player;
              event.trigger("loseMingzhi");
            }
          },
        };

        lib.element.content.yinchang = function () {
          event.result = {};
          player.storage.furrykill_yinchang1 = true;
          player.markSkill("furrykill_yinchang");
          game.log(player, '已吟唱');
          event.result.bool = true;
        }

        lib.element.player.yinchang = function () {
          var next = game.createEvent('yinchang');
          next.player = this;

          next.setContent('yinchang');
          next._args = Array.from(arguments);
          return next;
        }

        lib.element.content.unyinchang = function () {
          event.result = {};
          player.storage.furrykill_yinchang1 = false;
          player.unmarkSkill("furrykill_yinchang");
          game.log(player, '发动了吟唱效果');
          event.result.bool = true;
        }

        lib.element.player.unyinchang = function () {
          var next = game.createEvent('unyinchang');
          next.player = this;

          next.setContent('unyinchang');
          next._args = Array.from(arguments);
          return next;
        }

        //#endregion

        lib.dynamicTranslate["furrykill_qianlie"] = dynamicTranslate.furrykill_qianlie;
        lib.dynamicTranslate["furrykill_chengming"] = dynamicTranslate.furrykill_chengming;
        lib.dynamicTranslate["furrykill_sanyuan"] = dynamicTranslate.furrykill_sanyuan;
        lib.dynamicTranslate["furrykill_suqing"] = dynamicTranslate.furrykill_suqing;

        lib.characterReplace["furrykill_yongshi"] = ["furrykill_yongshi", "sp_furrykill_yongshi"];

        game.导入character = function (英文名, 翻译名, obj, 扩展包名) { var oobj = get.copy(obj); oobj.name = 英文名; oobj.character = obj.character.character; oobj.skill = obj.skill.skill; oobj.translate = Object.assign({}, obj.character.translate, obj.skill.translate); game.import('character', function () { if (lib.device || lib.node) { for (var i in oobj.character) { oobj.character[i][4].push('ext:' + 扩展包名 + '/' + i + '.jpg'); } } else { for (var i in oobj.character) { oobj.character[i][4].push('db:extension-' + 扩展包名 + ':' + i + '.jpg'); } } return oobj; }); lib.config.all.characters.push(英文名); if (!lib.config.characters.contains(英文名)) { lib.config.characters.push(英文名); } lib.translate[英文名 + '_character_config'] = 翻译名; };
        game.新增势力 = function (名字, 映射, 渐变) { var n, t; if (!名字) return; if (typeof 名字 == "string") { n = 名字; t = 名字 } else if (Array.isArray(名字) && 名字.length == 2 && typeof 名字[0] == "string") { n = 名字[0]; t = 名字[1] } else return; if (!映射 || !Array.isArray(映射) || 映射.length != 3) 映射 = [199, 21, 133]; var y = "(" + 映射[0] + "," + 映射[1] + "," + 映射[2]; var y1 = y + ",1)", y2 = y + ")"; var s = document.createElement('style'); var l; l = ".player .identity[data-color='diy" + n + "'],"; l += "div[data-nature='diy" + n + "'],"; l += "span[data-nature='diy" + n + "'] {text-shadow: black 0 0 1px,rgba" + y1 + " 0 0 2px,rgba" + y1 + " 0 0 5px,rgba" + y1 + " 0 0 10px,rgba" + y1 + " 0 0 10px}"; l += "div[data-nature='diy" + n + "m'],"; l += "span[data-nature='diy" + n + "m'] {text-shadow: black 0 0 1px,rgba" + y1 + " 0 0 2px,rgba" + y1 + " 0 0 5px,rgba" + y1 + " 0 0 5px,rgba" + y1 + " 0 0 5px,black 0 0 1px;}"; l += "div[data-nature='diy" + n + "mm'],"; l += "span[data-nature='diy" + n + "mm'] {text-shadow: black 0 0 1px,rgba" + y1 + " 0 0 2px,rgba" + y1 + " 0 0 2px,rgba" + y1 + " 0 0 2px,rgba" + y1 + " 0 0 2px,black 0 0 1px;}"; s.innerHTML = l; document.head.appendChild(s); if (渐变 && Array.isArray(渐变) && Array.isArray(渐变[0]) && 渐变[0].length == 3) { var str = "", st2 = []; for (var i = 0; i < 渐变.length; i++) { str += ",rgb(" + 渐变[i][0] + "," + 渐变[i][1] + "," + 渐变[i][2] + ")"; if (i < 2) st2[i] = "rgb(" + 渐变[i][0] + "," + 渐变[i][1] + "," + 渐变[i][2] + ")"; } var tenUi = document.createElement('style'); tenUi.innerHTML = ".player>.camp-zone[data-camp='" + n + "']>.camp-back {background: linear-gradient(to bottom" + str + ");}"; tenUi.innerHTML += ".player>.camp-zone[data-camp='" + n + "']>.camp-name {text-shadow: 0 0 5px " + st2[0] + ", 0 0 10px " + st2[1] + ";}"; document.head.appendChild(tenUi); } lib.group.add(n); lib.translate[n] = t; lib.groupnature[n] = "diy" + n; };

        game.import('card', function () {
          return {
            name: "furrykill_card",
            connect: true,
            card: {
              furrykill_jiasu: {
                audio: true,
                fullskin: true,
                type: 'trick',
                image: "ext:FurryKill/furrykill_jiasu.jpg",
                enable: true,
                selectTarget: -1,
                cardcolor: 'red',
                toself: true,
                filterTarget: function (card, player, target) {
                  return target == player;
                },
                modTarget: true,
                content: function () {
                  target.draw(1);
                  if (target.storage.furrykill_cardUseLimit != undefined) {
                    target.storage.furrykill_cardUseLimit[0] += 2;
                    target.markSkill("furrykill_cardUseLimit");
                  }
                },
                ai: {
                  basic: {
                    order: 7.2,
                    useful: 4.5,
                    value: 9.2
                  },
                  result: {
                    target: 2,
                  },
                  tag: {
                    draw: 2
                  }
                }
              },

            },
            translate: {
              furrykill_jiasu: "加速",
              furrykill_jiasu_info: "摸一张牌，此阶段你可以额外使用两张牌。",
            },
            list: [],
          }
        });
        lib.translate['furrykill_card_card_config'] = 'FurryKill';
        lib.config.all.cards.push('furrykill_card');
        if (!lib.config.cards.contains('furrykill_card')) lib.config.cards.remove('furrykill_card');

        game.新增势力(["furrykill_cat", "猫"], [37, 128, 237], [[37, 128, 237], [20, 60, 80]]);
        game.新增势力(["furrykill_fox", "狐"], [222, 68, 68], [[222, 68, 68], [80, 20, 20]]);
        game.新增势力(["furrykill_wolf", "狼"], [191, 191, 189], [[191, 191, 189], [60, 60, 60]]);
        game.新增势力(["furrykill_dragon", "龙"], [191, 191, 189], [[191, 191, 189], [60, 60, 60]]);
        game.新增势力(["furrykill_dog", "犬"], [68, 68, 222], [[68, 68, 222], [20, 20, 80]]);
        game.新增势力(["furrykill_tiger", "虎"], [249, 206, 110], [[249, 206, 110], [80, 60, 60]]);
        game.新增势力(["furrykill_rabbit", "兔"], [222, 68, 68], [[222, 68, 68], [80, 20, 20]]);
        game.导入character("FurryKill", "FurryKill", {
          connect: true,
          character: {
            character: {
              furrykill_shifeng: [
                "male",
                "furrykill_cat",
                3,
                ["furrykill_dingchen", "furrykill_suixin", "furrykill_xiaoshi"],
                ["hiddenSkill", "des:夜刃"],
              ],
              furrykill_yongshi: [
                "male",
                "furrykill_cat",
                4,
                ["furrykill_fenyou", "furrykill_zhian"],
                ["des:小黄苟"],
              ],
              furrykill_sword: [
                "male",
                "furrykill_fox",
                4,
                ["furrykill_shanjian", "furrykill_yvnian"],
                ["des:剑"],
              ],
              furrykill_xuankai: [
                "male",
                "furrykill_cat",
                3,
                ["furrykill_qianlie", "furrykill_youxia"],
                ["des:丛林猎杀者"],
              ],
              furrykill_heibai: [
                "male",
                "furrykill_fox",
                3,
                ["furrykill_xulei", "furrykill_shineng"],
                ["des:AP钙奶"],
              ],
              furrykill_xiaoba: [
                "male",
                "furrykill_cat",
                3,
                ["furrykill_lingfeng", "furrykill_zhuiying"],
                ["des:蓝飞机"],
              ],
              furrykill_anliang: [
                "male",
                "furrykill_wolf",
                3,
                ["furrykill_lvbing", "furrykill_hanren", "furrykill_ruiyan"],
                ["hiddenSkill", "des:珀瞳"],
              ],
              furrykill_guoguo: [
                "male",
                "furrykill_cat",
                4,
                ["furrykill_fuyun", "furrykill_changlong", "furrykill_qifu"],
                ["des:招财游侠"],
              ],
              furrykill_baitu: [
                "male",
                "furrykill_dragon",
                4,
                ["furrykill_lianfu", "furrykill_pojia"],
                ["des:一叶障目"],
              ],
              furrykill_yizhichuan: [
                "male",
                "furrykill_dog",
                3,
                ["furrykill_dielang", "furrykill_shouhe"],
                ["des:水之魔武士"],
              ],
              furrykill_xiaorui: [
                "male",
                "furrykill_fox",
                4,
                ["furrykill_yaodang", "furrykill_baolei", "furrykill_jiyong", "furrykill_yinchang"],
                ["des:雷电杨桃"],
              ],
              furrykill_gudong: [
                "male",
                "furrykill_tiger",
                4,
                ["furrykill_yanmu", "furrykill_zhuiren", "furrykill_xuenu"],
                ["hiddenSkill", "des:不存在的"],
              ],
              furrykill_qinhan: [
                "male",
                "furrykill_cat",
                3,
                ["furrykill_xunmei", "furrykill_luoxue", "furrykill_tanying"],
                ["hiddenSkill", "des:云水"],
              ],
              furrykill_lanyuan: [
                "male",
                "furrykill_wolf",
                4,
                ["furrykill_mingxue", "furrykill_shuangci", "furrykill_hanlv"],
                ["hiddenSkill", "des:霜狼"],
              ],
              furrykill_qingyu: [
                "male",
                "furrykill_wolf",
                3,
                ["furrykill_xunzhou", "furrykill_tansu", "furrykill_lingshi"],
                ["des:静时者"],
              ],
              sp_furrykill_yongshi: [
                "male",
                "furrykill_cat",
                3,
                ["furrykill_wuzhu", "furrykill_qunchong"],
                [],
              ],
              furrykill_haohai: [
                "male",
                "furrykill_dragon",
                4,
                ["furrykill_yongdai"],
                ["des:警长"],
              ],
              furrykill_shasha: [
                "male",
                "furrykill_fox",
                3,
                ["furrykill_jiyin", "furrykill_qingquan"],
                ["des:南蛮入侵"],
              ],
              furrykill_halifax: [
                "male",
                "furrykill_wolf",
                3,
                ["furrykill_xiaoxue", "furrykill_chengming"],
                ["des:窃慧士"],
              ],
              furrykill_aosen: [
                "male",
                "furrykill_wolf",
                4,
                ["furrykill_canghai", "furrykill_juanren"],
                ["des:碧浪蔚海"],
              ],
              furrykill_nangua: [
                "male",
                "furrykill_wolf",
                4,
                ["furrykill_yanfan", "furrykill_xueyue"],
                ["des:拉闸斑马"],
              ],
              furrykill_tier: [
                "male",
                "furrykill_fox",
                2,
                ["furrykill_sanwei", "furrykill_ganlin"],
                ["des:银月天狐"],
              ],
              furrykill_yueling: [
                "male",
                "furrykill_rabbit",
                3,
                ["furrykill_youxia", "furrykill_jixing", "furrykill_xiemu"],
                [],
              ],
              furrykill_wenhaowenhao: [
                "male",
                "furrykill_fox",
                3,
                ["furrykill_yvmo", "furrykill_sanyuan", "furrykill_yuanli", "furrykill_yinchang"],
                [],
              ],
              furrykill_han: [
                "male",
                "furrykill_cat",
                3,
                ["furrykill_qianmeng", "furrykill_zheyue"],
                ["des:小心玻璃"],
              ],
              furrykill_wanen: [
                "male",
                "furrykill_wolf",
                4,
                ["furrykill_suqing", "furrykill_shenfu"],
                [],
              ],
              furrykill_mingyu: [
                "male",
                "furrykill_cat",
                4,
                ["furrykill_enze", "furrykill_jianglin"],
                ["des:紫色大松鼠"],
              ],
              furrykill_mingyu_evil: [
                "male",
                "furrykill_cat",
                5,
                ["furrykill_quanneng1", "furrykill_quanneng2", "furrykill_quanneng3"],
                ["boss", "des:紫色大恶魔"],
              ],
              furrykill_moling: [
                "male",
                "furrykill_cat",
                4,
                ["furrykill_xingzhou", "furrykill_xingzhan", "furrykill_xinggong"],
                ["des:占星术士"],
              ],
              furrykill_yunlan: [
                "male",
                "furrykill_fox",
                4,
                ["furrykill_zhengfa", "furrykill_shouxiang"],
                ["des:大将军"],
              ],
              furrykill_zhanhou: [
                "male",
                "furrykill_dragon",
                3,
                ["furrykill_shunshan", "furrykill_yixing"],
                ["des:粘钩"],
              ],
            },
            translate: {
              furrykill_shifeng: "时风",
              furrykill_yongshi: "勇士",
              furrykill_sword: "斯沃",
              furrykill_xuankai: "轩恺",
              furrykill_heibai: "黑白",
              furrykill_xiaoba: "小巴",
              furrykill_anliang: "安谅",
              furrykill_guoguo: "果果",
              furrykill_baitu: "白荼",
              furrykill_yizhichuan: "伊织川",
              furrykill_xiaorui: "小瑞",
              furrykill_gudong: "咕咚",
              furrykill_qinhan: "倾寒",
              furrykill_lanyuan: "岚渊",
              furrykill_qingyu: "清羽",
              sp_furrykill_yongshi: "SP勇士",
              furrykill_haohai: "浩海",
              furrykill_shasha: "杀杀",
              furrykill_halifax: "哈利法尔",
              furrykill_aosen: "奥森",
              furrykill_nangua: "楠瓜",
              furrykill_tier: "提尔",
              furrykill_yueling: "月凌",
              furrykill_wenhaowenhao: "？？",
              furrykill_han: "涵",
              furrykill_wanen: "万恩",
              furrykill_mingyu: "冥榆",
              furrykill_mingyu_evil: "恶魔",
              furrykill_moling: "默灵",
              furrykill_yunlan: "云岚",
              furrykill_zhanhou: "战吼",
            },
          },
          characterTitle: {
          },
          skill: {
            skill: {
              furrykill_yinchang: {
                init: function (player) {
                  if (!player.storage.furrykill_yinchang1) player.storage.furrykill_yinchang1 = false;
                },
                trigger: { player: "phaseUseBefore" },
                prompt: "是否跳过出牌阶段进行吟唱？",
                intro: {
                  content: '马上要释放强力技能！',
                },
                marktext: '已吟唱',
                filter: function (event, player) {
                  return !player.storage.furrykill_yinchang1;
                },
                check: function (event, player) {
                  return false;
                },
                content: function () {
                  player.yinchang();
                  trigger.cancel();
                },
                ai: {
                  threaten: 0,
                  result: {
                    player: -1
                  },
                },
              },

              furrykill_dingchen: {
                trigger: {
                  player: "showCharacterAfter",
                },
                hiddenSkill: true,
                logTarget: function () {
                  return _status.currentPhase;
                },
                check: function (event, player) {
                  return get.attitude(player, _status.currentPhase) < 0;
                },
                filter: function (event, player) {
                  var target = _status.currentPhase;
                  return event.toShow.contains('furrykill_shifeng') && target && target != player;
                },
                content: function () {
                  var target = _status.currentPhase;
                  player.useCard({ name: 'sha', isCard: true }, target);
                },
              },

              furrykill_suixin: {
                group: ["furrykill_suixin_1", "furrykill_suixin_2"],
                locked: true,
                forced: true,
                subSkill: {
                  1: {
                    trigger: {
                      source: "damageBegin1",
                    },
                    forced: true,
                    filter: function (event) {
                      return event.player.isHealthy();
                    },
                    content: function () {
                      "step 0"
                      trigger.player.loseHp(1);
                    },
                    sub: true
                  },
                  2: {
                    trigger: {
                      target: "useCardToTargeted",
                    },
                    forced: true,
                    filter: function (event, player) {
                      if (event.card.name != 'sha' && event.card.name != 'juedou') return false;
                      return player.isTurnedOver() && player.countCards('he') > 0;;
                    },
                    content: function () {
                      "step 0";
                      player.chooseToDiscard("碎心：是否弃置一张牌以取消目标？", 'he');
                      "step 1"
                      if (result.bool) {
                        trigger.getParent().excluded.add(player);
                      }
                    },
                    sub: true
                  }
                },
              },

              furrykill_xiaoshi: {
                trigger: {
                  global: "phaseZhunbeiBegin",
                },
                filter: function (event, player) {
                  return player != event.player;
                },
                round: 1,
                check: function (event, player) {
                  return get.attitude(player, event.player) < 0;
                },
                content: function () {
                  "step 0";
                  player.storage.furrykill_xiaoshi_sign = true
                  event.card = { name: 'sha', isCard: true };
                  event.related = player.useCard(event.card, trigger.player);
                  "step 1";
                  if (!event.related || !game.hasPlayer2(function (current) {
                    return current.getHistory('damage', function (evt) {
                      return evt.getParent(2) == event.related;
                    }).length > 0;
                  })) {
                    player.storage.furrykill_xiaoshi_sign = undefined;
                    player.turnOver();
                  }
                },
                ai: {
                  threaten: 3,
                  result: {
                    player: function (player, target) {
                      var isFriend = get.attitude(player, target) > 0
                      if (isFriend) return -1;
                      if (target.countCards('h') >= 4) return -1;
                      return get.effect(target, { name: 'sha' }, player, player);
                    },
                  },
                  order: 4,
                  expose: 0.4,
                },
                group: ["furrykill_xiaoshi_damaged"],
                subSkill: {
                  damaged: {
                    trigger: {
                      source: "damageAfter",
                    },
                    forced: true,
                    popup: false,
                    filter: function (event, player) {
                      return player.storage.furrykill_xiaoshi_sign;
                    },
                    content: function () {
                      player.storage.furrykill_xiaoshi_sign = undefined;
                      var target = trigger.player;
                      if (target.isDead() || !target.countCards('he')) return;
                      player.discardPlayerCard(target, true, 'he');
                    },
                    sub: true,
                  },
                }
              },

              furrykill_fenyou: {
                trigger: { global: "useCardToBefore" },
                filter: function (event, player) {
                  return event.target != player
                    && event.player != player
                    && event.targets.length == 1
                    && ['basic', 'trick'].contains(get.type(event.card, false))
                    && player.inRange(event.target);
                },
                content: function () {
                  player.loseHp();
                  trigger.cancel();
                },
                ai: {
                  threaten: 2,
                  result: {
                    player: function (card, player, target) {
                      if (player.hp == 1) return -10;
                    },
                  },
                  result: {
                    target: function (player, target) {
                      return 6 + get.effect(target, card, player, _status.event.player);
                    },
                  },
                  order: 4,
                  expose: 0.4,
                },

              },

              furrykill_zhian: {
                trigger: {
                  global: "phaseZhunbeiBegin",
                },
                filter: function (event, player) {
                  if (!player.countCards('he', { color: 'black' })) return false;
                  return player != event.player;
                },
                frequent: true,
                content: function () {
                  'step 0';
                  player.chooseCard('he', '致安：将一张黑色牌交给' + get.translation(trigger.player) + "？", function (card, player, target) {
                    return get.color(card) === 'black';
                  }).set('ai', function (card) {
                    var isFriend = get.attitude(player, trigger.player) > 0
                    if (isFriend) return 14 - get.value(card);
                    return -1;
                  });
                  'step 1';
                  if (result.bool) {
                    trigger.player.gain(result.cards, player, 'giveAuto');
                    event.check2Str = "弃置一张红色牌，令" + get.translation(player) + "回复一点体力"
                    var list = ["摸一张牌", event.check2Str]
                    if (!trigger.player.countCards('he', { color: 'red' })) list.remove(event.check2Str);
                    trigger.player.chooseControl(list, true, function () {
                      if (list.contains(event.check2Str) && get.attitude(player, event.player) > 0 && !player.isHealthy())
                        return event.check2Str;
                      return "摸一张牌";
                    }).set('prompt', get.prompt2('furrykill_zhian'));
                  } else {
                    event.finish();
                  }
                  'step 2';
                  if (result.control == "摸一张牌") {
                    trigger.player.draw();
                    game.log(trigger.player, '摸了一张牌');
                  } else {
                    trigger.player.chooseToDiscard('he', true, { color: 'red' }).set('ai', function (card) {
                      return 7 - get.value(card);
                    });
                    player.recover();
                    game.log(trigger.player, '使', player, "回复了一点体力");
                  }
                },
                ai: {
                  expose: 0.5,
                  order: 9.1,
                  threaten: 1,
                  result: {
                    target: function (player, target) {
                      return 5;
                    },
                  },
                },
              },

              furrykill_shanjian: {
                enable: "phaseUse",
                usable: 1,
                unique: true,
                filterTarget: function (card, player, target) {
                  return target != player;
                },
                content: function () {
                  "step 0"
                  player.addTempSkill('furrykill_shanjian_1');
                  player.storage.furrykill_shanjian1 = target;
                  "step 1"
                  player.draw();
                },
                ai: {
                  order: 7,
                  result: {
                    player: function (player, target) {
                      return -get.attitude(player, target);
                    },
                  },
                },
                subSkill: {
                  1: {
                    onremove: function (player) {
                      delete player.storage.furrykill_shanjian1;
                    },
                    mod: {
                      globalFrom: function (from, to) {
                        if (to == from.storage.furrykill_shanjian1) return -Infinity;
                      },
                      playerEnabled: function (card, player, target) {
                        if (player != target && player.storage.furrykill_shanjian1 != target) return false;
                      }
                    },
                    charlotte: true,
                    sub: true,
                  }
                }
              },

              furrykill_yvnian: {
                trigger: {
                  source: "damageBegin1",
                },
                logTarget: "player",
                frequent: true,
                filter: function (event) {
                  return event.nature;
                },
                content: function () {
                  "step 0"
                  var list = ["伤害+1", "伤害-1", "取消"];
                  if (!player.countCards('he')) list.remove("伤害+1");
                  player.chooseControl(list, function () {
                    var isFriend = get.attitude(player, trigger.player) > 0
                    if (!isFriend && list.contains("伤害+1")) {
                      return "伤害+1";
                    }
                    if (isFriend) return "伤害-1";
                    return "取消";
                  }).set('prompt', get.prompt2('furrykill_yvnian'));
                  "step 1"
                  if (result.control == "伤害+1") {
                    player.chooseToDiscard(true, 'he');
                    trigger.num++;
                    game.log(player, '弃了一张牌并使伤害+1');
                  } else if (result.control == "伤害-1") {
                    trigger.num--;
                    player.draw();
                    game.log(player, '摸了一张牌并使伤害-1');
                  }
                }
              },

              furrykill_qianlie: {
                mark: true,
                locked: false,
                zhuanhuanji: true,
                marktext: "☯",
                intro: {
                  content: function (storage, player, skill) {
                    var str = !player.storage.furrykill_qianlie
                      ? "以你为目标的锦囊牌结算完毕后，可以使用一张杀或伤害锦囊牌。"
                      : "你造成的伤害结算完毕后，可以发现一张牌。若此时是你的出牌阶段，你跳过本回合的弃牌阶段，并且本阶段你不能再使用牌。";
                    return str;
                  },
                },
                group: ["furrykill_qianlie_1", "furrykill_qianlie_2"],
                subSkill: {
                  1: {
                    prompt2:
                      "以你为目标的锦囊牌结算完毕后，可以使用一张杀或伤害锦囊牌。",
                    trigger: { global: "useCardAfter" },
                    audio: 2,
                    direct: true,
                    filter: function (event, player) {
                      return (
                        !player.storage.furrykill_qianlie
                        && event.targets.contains(player)
                        && get.type(event.card) == "trick"
                      );
                    },
                    content: function () {
                      "step 0";
                      var list = ["确定", "取消"];
                      event.qianlieUsable = player.hasCard(function (card) {
                        return get.name(card) == "sha"
                          || (get.type2(card, false) == "trick"
                            && get.tag({ name: card.name }, "damage"));
                      })
                      if (!event.qianlieUsable) list.remove("确定");

                      player.chooseControl(list, true, function () {
                        if (list.contains("确定"))
                          return "确定";
                        return "取消";
                      }).set('prompt', get.prompt2('furrykill_qianlie_1'));
                      'step 1'
                      if (result.control == "确定") {
                        player.changeZhuanhuanji("furrykill_qianlie");
                        player.markSkill("furrykill_qianlie");

                        player.chooseToUse(
                          "潜猎：是否使用一张杀或伤害锦囊牌", true,
                          function (card) {
                            return (get.name(card) == "sha"
                              || (get.type2(card, false) == "trick" &&
                                get.tag({ name: card.name }, "damage"))
                            ) && player.hasUseTarget(card);
                          }
                        ).logSkill = "furrykill_qianlie";
                      }
                    },
                    sub: true,
                  },
                  2: {
                    prompt2: "你造成的伤害结算完毕后，可以发现一张牌。若此时是你的出牌阶段，你跳过本回合的弃牌阶段，并且本阶段你不能再使用牌。",
                    trigger: { source: "damageEnd" },
                    audio: 2,
                    filter: function (event, player) {
                      return player.storage.furrykill_qianlie;
                    },
                    content: function () {
                      "step 0";
                      var cards = get.cards(3);
                      if (cards.length == 0) event.goto(2);
                      var next = player.furrykillDiscoverCard('潜猎：发现一张牌', cards, true);
                      next.set("gotoOrdering", true);
                      "step 1";
                      var card = result.card;
                      player.gain(card, "draw");
                      game.log(player, '从牌堆发现了', card);

                      if (_status.currentPhase == player) {
                        var evt = _status.event.getParent("phaseUse");
                        if (evt && evt.name == "phaseUse") {
                          player.skip("phaseDiscard");
                          player.addTempSkill("furrykill_qianlie_unusable");
                        }
                      }
                      "step 2";
                      player.changeZhuanhuanji("furrykill_qianlie");
                      player.markSkill("furrykill_qianlie");
                    },
                    sub: true,
                  },
                  unusable: {
                    charlotte: true,
                    mod: {
                      cardEnabled: function (card, player) {
                        return false;
                      },
                    },
                    sub: true,
                  }
                }
              },

              furrykill_youxia: {
                audio: 2,
                trigger: {
                  player: "phaseDrawBegin2",
                },
                forced: true,
                filter: function (event, player) {
                  return !event.numFixed;
                },
                content: function () {
                  trigger.num++;
                },
              },

              furrykill_xulei: {
                group: ["furrykill_xulei_1", "furrykill_xulei_2", "furrykill_xulei_3", "furrykill_xulei_getCard"],
                locked: true,
                forced: true,
                ai: {
                  maixie: true,
                },
                subSkill: {
                  1: {
                    audio: 2,
                    trigger: {
                      player: "turnOverBefore"
                    },
                    forced: true,
                    filter: function (event, player) {
                      return player.isTurnedOver();
                    },
                    content: function () {
                      'step 0';
                      if (player.countCards('j')) {
                        var judges = player.getCards('j');
                        for (var i = 0; i < judges.length; i++) {
                          player.addJudgeNext(judges[i]);
                        }
                        player.disableJudge();
                      }
                      'step 1';
                      //player.turnOver();
                      trigger.cancel();
                    },
                    sub: true,
                  },
                  2: {
                    trigger: {
                      global: "gameStart",
                    },
                    forced: true,
                    popup: false,
                    content: function () {
                      player.turnOver();
                      player.disableJudge();
                    },
                    sub: true,
                  },
                  3: {
                    mod: {
                      targetEnabled: function (card, player, target) {
                        if (get.type(card) == 'delay') return false;
                      },
                    },
                    sub: true,
                  },
                  getCard: {
                    audio: 2,
                    forced: true,
                    trigger: {
                      target: "useCardToTarget",
                      global: "damageEnd",
                    },
                    filter: function (event, player) {
                      if (event.name == "useCardToTarget"
                        && get.type(event.card) == 'equip') return false;
                      return player.countCards('h') < 6;
                    },
                    content: function () {
                      player.draw();
                    },
                    sub: true,
                  }
                }
              },

              furrykill_shineng: {
                audio: 2,
                trigger: {
                  global: "phaseEnd",
                },
                frequent: true,
                filter: function (event, player) {
                  return player.countCards('he') > 0
                },
                content: function () {
                  'step 0'
                  player.chooseToDiscard('he',
                    '势能：你可以弃置任意数量的牌。若这些牌的点数之和不小于13，你可以使用其中的一张；若点数之和不小于32，你可以造成一点雷电伤害。',
                    [1, player.countCards('he')]).set('ai', function (card) {
                      if (player.countCards('he') >= 6) return 32;
                      return -1;// 势能的ai，暂时默认不弃牌
                    });
                  'step 1'
                  event.totalCards = 0;
                  if (result.bool) {
                    var total = 0;
                    var cards = result.cards;
                    for (var i = 0; i < cards.length; i++) {
                      total += get.number(cards[i]);
                    }
                    event.dropCards = cards;
                    event.totalCards = total;
                  } else {
                    event.finish();
                  }
                  'step 2'
                  if (event.totalCards >= 13) {
                    event.usableCards = event.dropCards.filter(function (i) {
                      return (get.position(i, true) == 'd' && i.name != "shan" && player.hasUseTarget(i));
                    })
                    if (event.usableCards.length > 0) {
                      player.chooseButton(['势能：是否使用其中的一张牌？', event.usableCards]).set('ai', function (button) {
                        return _status.event.player.getUseValue(button.link);
                      });
                    }
                  }
                  'step 3'
                  if (event.totalCards >= 13 && event.usableCards.length > 0 && result.bool) {
                    player.$gain2(result.links[0], false);
                    game.delayx();
                    player.chooseUseTarget(true, result.links[0], false).logSkill = 'furrykill_shineng';
                  }
                  'step 4'
                  if (event.totalCards >= 30) {
                    player.chooseTarget('势能：是否选择一个目标并对其造成1点雷电伤害？', false, function (card, player, target) {
                      return true;
                    }).set('ai', function (target) {
                      return get.damageEffect(target, _status.event.player, _status.event.player, 'thunder');
                    });
                  }
                  'step 5'
                  if (event.totalCards >= 30 && result.bool) {
                    var target = result.targets[0];
                    player.line(target, 'thunder');
                    target.damage(1, 'thunder');
                  }
                },
              },

              furrykill_lingfeng: {
                audio: true,
                trigger: {
                  global: "loseAfter",
                },
                filter: function (event, player) {
                  if (event.type != 'discard') return false;
                  if (event.player == player) return false;
                  var parentEvent = event.getParent("discardPlayerCard");
                  if (parentEvent != {} && parentEvent.target != parentEvent.player) return false;
                  if (!player.countCards('he')) return false;
                  for (var i = 0; i < event.cards2.length; i++) {
                    if (get.position(event.cards2[i], true) == 'd') {
                      return true;
                    }
                  }
                  return false;
                },
                direct: true,
                unique: true,
                gainable: true,
                content: function () {
                  "step 0"
                  if (trigger.delay == false) game.delay();
                  "step 1"
                  var cards = [];
                  for (var i = 0; i < trigger.cards2.length; i++) {
                    if (get.position(trigger.cards2[i], true) == 'd') {
                      cards.push(trigger.cards2[i]);
                    }
                  }
                  if (cards.length) {
                    var maxval = 0;
                    for (var i = 0; i < cards.length; i++) {
                      var tempval = get.value(cards[i]);
                      if (tempval > maxval) {
                        maxval = tempval;
                      }
                    }
                    maxval += cards.length - 1;
                    var next = player.chooseToDiscard('he', '灵风：弃置一张牌以获得其中一张牌');
                    next.set('ai', function (card) {
                      return _status.event.maxval - get.value(card);
                    });
                    next.set('maxval', maxval);
                    event.cards = cards;
                  }
                  "step 2"
                  if (result.bool) {
                    //game.cardsGotoOrdering(event.cards);
                    event.videoId = lib.status.videoId++;
                    event.time = get.utc();

                    player.chooseButton(['灵风：获得其中一张牌', event.cards]).set('filterButton', function (button) {
                      return ui.selected.buttons.length == 0;
                    }).set('ai', function (button) {
                      return get.value(button.link);
                    }).set('cards', event.cards).logSkill = 'furrykill_lingfeng';

                    var time = 1000 - (get.utc() - event.time);
                    if (time > 0) {
                      game.delay(0, time);
                    }
                  } else {
                    event.finish();
                  }
                  "step 3"
                  if (result.bool && result.links) {
                    event.cards2 = result.links;
                  } else {
                    event.finish();
                  }
                  "step 4"
                  player.gain(event.cards2[0], 'gain2', 'log');
                },
                ai: {
                  threaten: 1.3,
                },
              },

              furrykill_zhuiying: {
                audio: 2,
                usable: 1,
                trigger: {
                  player: "loseAfter",
                },
                filter: function (event, player) {
                  if (event.type != 'discard') return false;
                  for (var i of event.cards2) {
                    if (get.position(i, true) == 'd' && player.hasUseTarget(i)) return true;
                  }
                  return false;
                },
                content: function () {
                  'step 0'
                  player.chooseButton(['追影：是否使用其中的一张牌？', trigger.cards2.filter(function (i) {
                    return (get.position(i, true) == 'd' && player.hasUseTarget(i));
                  })]).set('ai', function (button) {
                    return _status.event.player.getUseValue(button.link);
                  });
                  'step 1'
                  if (result.bool) {
                    player.$gain2(result.links[0], false);
                    game.delayx();
                    player.chooseUseTarget(true, result.links[0], false).logSkill = 'furrykill_zhuiying';
                  } else player.storage.counttrigger.furrykill_zhuiying--;
                },
              },

              furrykill_lvbing: {
                trigger: {
                  player: "showCharacterAfter",
                },
                hiddenSkill: true,
                popup: false,
                filter: function (event, player) {
                  var target = _status.currentPhase;
                  return event.toShow.contains('furrykill_anliang') && target && target != player;
                },
                content: function () {
                  'step 0';
                  if (player.countCards('he')) {
                    player.chooseCard('he', '履冰：是否将一张牌置于武将牌上作为【霜】？').set('ai', function (card) {
                      return 5 - get.value(card);
                    });
                  } else {
                    event.finish();
                  }
                  'step 1';
                  if (result.bool) {
                    player.addToExpansion(result.cards, player, 'giveAuto').gaintag.add('furrykill_hanren');
                    player.logSkill('furrykill_lvbing');
                  }
                },
              },

              furrykill_hanren: {
                group: ["furrykill_hanren_1"],
                trigger: { player: 'phaseJieshuBegin' },
                popup: false,
                notemp: true,
                filter: function (event, player) {
                  return player.countCards('he');
                },
                content: function () {
                  'step 0';
                  player.chooseCard('he', '寒刃：是否将一张牌置于武将牌上作为【霜】？');
                  'step 1';
                  if (result.bool) {
                    player.addToExpansion(result.cards, player, 'giveAuto').gaintag.add('furrykill_hanren');
                    player.logSkill('furrykill_hanren');
                  }
                },
                intro: {
                  content: 'expansion',
                  markcount: 'expansion',
                },
                marktext: '霜',
                onremove: function (player, skill) {
                  var cards = player.getExpansions("furrykill_hanren");
                  if (cards.length) player.loseToDiscardpile(cards);
                },
                subSkill: {
                  1: {
                    trigger: { global: "phaseUseBegin" },
                    popup: false,
                    frequent: true,
                    filter: function (event, player) {
                      return event.player != player
                        && event.player.isAlive()
                        && player.getExpansions('furrykill_hanren').length > 0;
                    },
                    content: function () {
                      'step 0';
                      event.target2 = _status.currentPhase;
                      event.shuang = player.getExpansions('furrykill_hanren');
                      player.chooseButton(['寒刃：是否交给其一张【霜】？其不能使用、打出或弃置与霜类别相同的牌，直到此回合结束。', event.shuang]).set('filterButton', function (button) {
                        return ui.selected.buttons.length == 0;
                      }).set('ai', function (button) {
                        if (get.attitude(player, event.target2) > 0) return -1;
                        return 10 - get.value(button.link);
                      }).set('cards', event.shuang);
                      'step 1';
                      if (result.bool && result.links) {
                        event.usedShuang = result.links[0];
                        event.target2.gain(event.usedShuang, player, 'giveAuto');
                      } else {
                        event.finish();
                      }
                      'step 2';
                      event.target2.storage.furrykill_hanren2 = get.type(event.usedShuang, 'trick');
                      'step 3';
                      event.target2.addTempSkill("furrykill_hanren2");
                      game.log(player, '对', event.target2, '发动了【寒刃】，【霜】为', event.usedShuang);
                    },
                    sub: true,
                  }
                }
              },
              furrykill_hanren2: {
                mark: true,
                charlotte: true,
                forced: true,
                intro: {
                  content: "不能使用、打出或弃置与霜类别相同的牌"
                },
                mod: {
                  cardDiscardable: function (card, player) {
                    if (get.type(card, 'trick') == player.storage.furrykill_hanren2) return false;
                  },
                  cardEnabled: function (card, player) {
                    if (get.type(card, 'trick') == player.storage.furrykill_hanren2) return false;
                  },
                  cardEnabled2: function (card, player) {
                    if (get.type(card, 'trick') == player.storage.furrykill_hanren2) return false;
                  },
                },
                onremove: function (player) {
                  delete player.storage.furrykill_hanren2;
                },
              },

              furrykill_ruiyan: {
                enable: 'phaseUse',
                usable: 1,
                filterTarget: function (card, player, target) {
                  return target != player && target.countCards('h') > 0;
                },
                content: function () {
                  'step 0';
                  player.viewHandcards(target);
                  'step 1';
                  var cards = target.getCards('h');
                  var types = cards.map((c) => {
                    return get.type(c);
                  });
                  var typeCount = types.filter((item, index) => {
                    return types.indexOf(item) === index;
                  }).length;

                  if (typeCount >= 2) {
                    player.gainPlayerCard(1, 'h', target, true, 'visible')
                  } else {
                    target.gainPlayerCard(1, 'he', player, true)
                  }
                },
                ai: {
                  order: 10,
                  result: {
                    player: function (player, target) {
                      if (get.attitude(player, target) > 0) return -1;
                      if (target.countCards('h') >= 4) return -get.attitude(player, target);
                      return -1;
                    },
                  },
                },
              },

              furrykill_fuyun: {
                locked: true,
                forced: true,
                trigger: { player: 'phaseBegin' },
                content: function () {
                  player.addTempSkill("furrykill_fuyun_1")
                },
                subSkill: {
                  1: {
                    locked: true,
                    forced: true,
                    mod: {
                      suit: function (card, suit) {
                        if (suit == 'spade') return 'heart';
                      },
                    },
                    sub: true,
                  }
                }
              },

              furrykill_changlong: {
                trigger: { player: 'useCardToTarget' },
                direct: true,
                filter: function (event, player) {
                  var card = event.card;
                  var info = get.info(card);
                  if (get.suit(card) != 'heart') return false;
                  if (!event.isFirstTarget) return false;
                  if (info.allowMultiple == false) return false;
                  if (event.targets && !info.multitarget) {
                    if (game.hasPlayer(function (current) {
                      return !event.targets.contains(current) && lib.filter.targetEnabled2(event.card, event.player, current);
                    })) {
                      return true;
                    }
                  }
                  return false;
                },
                content: function () {
                  'step 0'
                  var prompt2 = '为' + get.translation(trigger.card) + '额外指定一名角色成为目标'
                  player.chooseTarget(get.prompt('furrykill_changlong'), function (card, player, target) {
                    var player = _status.event.source;
                    return !_status.event.targets.contains(target) && lib.filter.targetEnabled2(_status.event.card, player, target);
                  }).set('prompt2', prompt2).set('ai', function (target) {
                    var trigger = _status.event.getTrigger();
                    var player = _status.event.source;
                    return get.effect(target, trigger.card, player, _status.event.player);
                  }).set('targets', trigger.targets).set('card', trigger.card).set('source', trigger.player);
                  'step 1'
                  if (result.bool) {
                    if (!event.isMine() && !event.isOnline()) game.delayx();
                    event.targets = result.targets;
                  }
                  else {
                    event.finish();
                  }
                  'step 2'
                  if (event.targets) {
                    player.logSkill('furrykill_changlong', event.targets);
                    trigger.targets.addArray(event.targets);
                    game.log(event.targets, '也成为了', trigger.card, '的目标');
                  }
                }
              },

              furrykill_qifu: {
                unique: true,
                juexingji: true,
                forced: true,
                trigger: { player: 'phaseZhunbeiBegin' },
                skillAnimation: true,
                animationColor: 'thunder',
                init: function (player) {
                  if (!player.storage.furrykill_qifu) player.storage.furrykill_qifu = 0;
                },
                intro: {
                  content: '已祈福#次'
                },
                filter: function (event, player) {
                  return player.hasSkill('furrykill_changlong') && player.storage.furrykill_qifu >= 7;
                },
                content: function () {
                  player.awakenSkill('furrykill_qifu');
                  player.loseMaxHp();
                  player.removeSkill('furrykill_changlong');
                  player.removeSkill('furrykill_qifu_1');
                  player.addSkill('furrykill_zhaocai');
                },
                group: ["furrykill_qifu_1"],
                subSkill: {
                  1: {
                    forced: true,
                    trigger: { player: "useCard" },
                    filter: function (event, player) {
                      return event.card && get.suit(event.card) == 'heart';
                    },
                    content: function () {
                      player.storage.furrykill_qifu++;
                      player.markSkill('furrykill_qifu');
                    },
                  }
                }
              },

              furrykill_zhaocai: {
                enable: 'phaseUse',
                filterTarget: function (card, player, target) {
                  return target != player;
                },
                filter: function (event, player) {
                  return player.countCards('he', { suit: 'heart' });
                },
                filterCard: function (card) {
                  return get.suit(card) == 'heart';
                },
                position: 'he',
                content: function () {
                  target.draw(2);
                },
              },

              furrykill_lianfu: {
                init: function (player) {
                  if (!player.storage.furrykill_lianfu) player.storage.furrykill_lianfu = 0;
                },
                group: ["furrykill_lianfu_1", "furrykill_lianfu_2"],
                locked: true,
                forced: true,
                subSkill: {
                  1: {
                    trigger: { global: "gameStart" },
                    forced: true,
                    popup: false,
                    content: function () {
                      player.link();
                    },
                    sub: true,
                  },
                  2: {
                    trigger: { player: 'linkBefore' },
                    forced: true,
                    prompt2: "你的武将牌重置时，改为你增加一点体力上限，然后选择一项",
                    filter: function (event, player) {
                      return player.isLinked();
                    },
                    content: function () {
                      'step 0';
                      player.gainMaxHp();
                      var list = ["摸两张牌", "获得场上的一张牌", "于当前回合结束后横置至多两名其他角色"];

                      if (!game.hasPlayer(function (current) {
                        return current.countGainableCards(player, 'ej') > 0;
                      })) list.remove("获得场上的一张牌");

                      player.chooseControl(list, true, function () {
                        return "摸两张牌";
                      }).set('prompt', get.prompt2('furrykill_lianfu_2'));
                      'step 1';
                      if (result.control == "摸两张牌") {
                        player.draw(2);
                      } else if (result.control == "获得场上的一张牌") {
                        player.chooseTarget('请选择一名角色，获得其装备区或判定区内的一张牌', true, function (card, player, target) {
                          return target.countGainableCards(player, 'ej') > 0;
                        }).set('ai', function (target) {
                          var player = _status.event.player;
                          var att = get.attitude(player, target);
                          if (att > 0 && target.countCards('ej', function (card) {
                            return get.position(card) == 'j' || get.value(card, target) <= 0;
                          })) return 2 * att;
                          else if (att < 0 && target.countCards('e', function (card) {
                            return get.value(card, target) > 5;
                          })) return -att;
                          return -1;
                        });
                      } else {
                        if (!player.hasSkill("furrykill_lianfu_3")) player.addSkill("furrykill_lianfu_3");
                        player.storage.furrykill_lianfu++;
                      }
                      'step 2';
                      if (result.bool) {
                        var target = result.targets[0];
                        player.logSkill('furrykill_lianfu', target);
                        player.gainPlayerCard(target, 'ej', true);
                      }
                      trigger.cancel();
                    },
                    sub: true,
                  },
                  3: {
                    trigger: { global: "phaseAfter" },
                    direct: true,
                    filter: function (event, player) {
                      return player.storage.furrykill_lianfu > 0;
                    },
                    content: function () {
                      'step 0';
                      player.chooseTarget('链缚：横置至多两名其他角色', [0, 2], function (card, player, target) {
                        return target != player && !target.isLinked();
                      }).ai = function (target) {
                        return -get.attitude(player, target);
                      };
                      'step 1';
                      if (result.bool) {
                        var length = result.targets.length;
                        for (let i = 0; i < length; i++) {
                          result.targets[i].link(true);
                        }
                        player.logSkill('furrykill_lianfu', result.targets);
                      }
                      'step 2';
                      player.storage.furrykill_lianfu--;
                      if (player.storage.furrykill_lianfu > 0) {
                        event.goto(0);
                      } else {
                        player.removeSkill("furrykill_lianfu_3");
                      }
                    },
                    sub: true,
                  }
                }
              },

              furrykill_pojia: {
                skillAnimation: true,
                animationColor: "thunder",
                unique: true,
                juexingji: true,
                trigger: {
                  player: "dying",
                },
                forced: true,
                filter: function (event, player) {
                  return player.hasSkill("furrykill_lianfu");
                },
                content: function () {
                  "step 0"
                  player.removeSkill("furrykill_lianfu");
                  "step 1"
                  player.recover(Infinity);
                  "step 2"
                  player.addSkill('furrykill_pojia_after');
                }
              },
              furrykill_pojia_after: {
                trigger: { global: "phaseAfter" },
                direct: true,
                charlotte: true,
                content: function () {
                  "step 0"
                  player.drawTo(player.maxHp);
                  "step 1"
                  game.countPlayer(function (current) {
                    current.link(true);
                  });
                  game.log(player, '横置了所有角色')
                  game.delayx();
                  "step 2"
                  player.removeSkill("furrykill_pojia_after");
                }
              },

              furrykill_dielang: {
                locked: true,
                forced: true,
                trigger: { player: 'useCard' },
                filter: function (event, player) {
                  return _status.currentPhase == player;
                },
                intro: {
                  content: '点数为#'
                },
                content: function () {
                  'step 0';
                  var dice = get.number(trigger.card);
                  if (dice == null) dice = -1;
                  var skip = player.storage.furrykill_dielang == 0;
                  var drop = dice <= player.storage.furrykill_dielang;
                  player.storage.furrykill_dielang = dice;
                  player.markSkill('furrykill_dielang');
                  if (drop) event.goto(2);
                  if (skip) event.finish();
                  'step 1';
                  player.draw();
                  event.finish();
                  'step 2';
                  var count = player.countDifferentCard('he');
                  var list = ['弃置三张类别不同的牌', '结束出牌阶段'];
                  if (count < 3) {
                    list.remove('弃置三张类别不同的牌');
                  }
                  player.chooseControl(list, true, function () {
                    if (list.contains('弃置三张类别不同的牌')) return '弃置三张类别不同的牌';
                    return '结束出牌阶段';
                  }).set('prompt', '叠浪：弃置三张类别不同的牌或于此牌结算完毕后结束出牌阶段。');
                  'step 3';
                  if (result.control == '结束出牌阶段') {
                    var evt = _status.event.getParent('phaseUse');
                    if (evt && evt.name == 'phaseUse') {
                      evt.skipped = true;
                    }
                    event.finish();
                  }
                  'step 4';
                  var next = player.chooseToDiscard('叠浪：弃置三张类别不同的牌', 3,
                    lib.filter.filterDifferentTypes, 'he', true);
                  next.set('num', num);
                  next.set('complexCard', true);
                  next.set('ai', function (card) {
                    return 9 - get.value(card);
                  });
                },
                group: ["furrykill_dielang_1", "furrykill_dielang_2"],
                subSkill: {
                  1: {
                    direct: true,
                    charlotte: true,
                    trigger: { player: "phaseUseBegin" },
                    content: function () {
                      player.storage.furrykill_dielang = 0;
                    },
                    sub: true,
                  },
                  2: {
                    direct: true,
                    charlotte: true,
                    trigger: { player: "phaseUseAfter" },
                    content: function () {
                      player.storage.furrykill_dielang = 0;
                      player.unmarkSkill('furrykill_dielang');
                    },
                    sub: true,
                  }
                }
              },

              furrykill_shouhe: {
                enable: "phaseUse",
                usable: 1,
                filterCard: function (card, player) {
                  var minDice = player.getCards('h').map((item) => {
                    return get.number(item);
                  }).reduce((a, b) => a < b ? a : b);
                  return get.number(card) == minDice;
                },
                viewAs: {
                  name: "sha",
                  nature: "thunder",
                  shouhe: true,
                },
                intro: {
                  content: '手牌上限加#'
                },
                viewAsFilter: function (player) {
                  if (!player.countCards('h')) return false;
                },
                prompt: "将一张点数最小的手牌当做无次数限制的雷杀使用",
                onuse: function (result, player) {
                  var dice = get.number(result.cards[0]);
                  var delta = player.storage.furrykill_dielang - dice;
                  if (delta <= -8 || delta >= 8) {
                    player.storage.furrykill_shouhe += 2;
                    player.markSkill('furrykill_shouhe');
                  }
                },
                ai: {
                  order: 1,
                  result: {
                    player: function (player) {
                      if (player.countCards('h') >= 2) return 1;
                      return -1;
                    },
                  },
                },
                group: ["furrykill_shouhe_1", "furrykill_shouhe_2", "furrykill_shouhe_3"],
                subSkill: {
                  1: {
                    mod: {
                      cardUsable: function (card, player) {
                        if (card.name == 'sha' && card.shouhe) return Infinity;
                      }
                    },
                    sub: true,
                  },
                  2: {
                    direct: true,
                    charlotte: true,
                    mod: {
                      maxHandcard: function (player, num) {
                        if (player.storage.furrykill_shouhe)
                          return num + player.storage.furrykill_shouhe;
                        return num;
                      },
                    },
                    trigger: { player: "phaseBefore" },
                    content: function () {
                      player.storage.furrykill_shouhe = 0;
                    },
                    sub: true,
                  },
                  3: {
                    direct: true,
                    charlotte: true,
                    trigger: { player: "phaseAfter" },
                    content: function () {
                      player.unmarkSkill('furrykill_shouhe');
                    },
                    sub: true,
                  }
                }
              },

              furrykill_yaodang: {
                trigger: {
                  player: "loseEnd",
                },
                locked: true,
                forced: true,
                filter: function (event, player) {
                  return event.type == 'discard'
                    && event.getParent(3).name == 'phaseDiscard'
                    && event.cards.filterInD('d').length > 0;
                },
                content: function () {
                  player.draw();

                  if (player.storage.furrykill_yinchang1) {
                    player.unyinchang();
                    player.damage();
                  }

                },
              },

              furrykill_baolei: {
                trigger: {
                  player: "phaseJieshuBegin",
                },
                filter: function (event, player) {
                  return player.storage.furrykill_yinchang1;
                },
                content: function () {
                  "step 0";
                  player.chooseTarget(function (card, player, target) {
                    return true;
                  }, get.prompt('furrykill_baolei'), [2, 2]).ai = function (target) {
                    return get.damageEffect(target, player, player);
                  }
                  "step 1";
                  if (result.bool) {
                    game.log(trigger.player, '发动了吟唱效果');

                    event.targets = result.targets.sortBySeat();
                    event.num = 0;
                  } else {
                    event.finish();
                  }
                  "step 2";
                  if (event.num < event.targets.length) {
                    event.targets[event.num].damage(1, 'thunder');
                    event.num++;
                  }
                  if (event.num != event.targets.length)
                    event.redo();
                  "step 3";
                  player.unyinchang();
                },
              },

              furrykill_jiyong: {
                init: function (player) {
                  player.storage.furrykill_jiyong = false;
                },
                unique: true,
                enable: "phaseUse",
                skillAnimation: true,
                animationColor: "thunder",
                limited: true,
                filter: function (event, player) {
                  return !player.storage.furrykill_jiyong && !player.storage.furrykill_yinchang1;
                },
                content: function () {
                  player.awakenSkill('furrykill_jiyong');
                  player.storage.furrykill_jiyong = true;
                  player.yinchang();
                },
                ai: {
                  order: 1,
                  result: {
                    player: function (player) {
                      if (player.countCards('h') <= player.hp) return 1;
                      return -1;
                    },
                  },
                },
              },

              furrykill_yanmu: {
                trigger: {
                  player: "showCharacterAfter",
                },
                forced: true,
                hiddenSkill: true,
                filter: function (event, player) {
                  return event.toShow.contains('furrykill_gudong') && player != _status.currentPhase;
                },
                content: function () {
                  player.addTempSkill('furrykill_yanmu2');
                },
              },
              furrykill_yanmu2: {
                mod: {
                  targetEnabled: function (card, player, target, now) {
                    if (card.name == 'sha' || card.name == 'juedou') return false;
                  },
                },
              },

              furrykill_zhuiren: {
                popup: false,
                trigger: {
                  player: "useCardAfter",
                },
                filter: function (event, player) {
                  var evt = event.getParent('phaseUse');
                  if (!evt || evt.player != player
                    || get.type(event.card) != 'trick'
                    || !player.countCards('h')) return false;

                  if (player.hasSkill("furrykill_xuenu1")) return true;

                  if (player.getHistory('useCard', function (ev) {
                    return ev.getParent('phaseUse') == evt && get.type(ev.card) == 'trick'
                  }).indexOf(event) == 0) return true;

                  return false;
                },
                content: function () {
                  var next = player.chooseToUse();
                  next.logSkill = 'furrykill_zhuiren';
                  next.set('openskilldialog', '追刃：将一张手牌当杀使用（此杀无距离和次数限制）');
                  next.set('norestore', true);
                  next.set('_backupevent', 'furrykill_zhuirenx');
                  next.set('custom', {
                    add: {},
                    replace: { window: function () { } }
                  });
                  next.backup('furrykill_zhuirenx');
                },
                group: ["furrykill_zhuiren_1", "furrykill_zhuiren_draw"],
                subSkill: {
                  1: {
                    mod: {
                      cardUsable: function (card, player) {
                        if (card.name == 'sha' && card.zhuiren) return Infinity;
                      },
                      targetInRange: function (card) {
                        if (card.name == 'sha' && card.zhuiren) return true;
                      }
                    },
                    sub: true,
                  },
                  draw: {
                    trigger: {
                      source: "damageAfter",
                    },
                    forced: true,
                    popup: false,
                    filter: function (event) {
                      var evt = event.getParent('furrykill_zhuiren');
                      return evt && evt.name == "furrykill_zhuiren";
                    },
                    content: function () {
                      player.draw();
                    },
                    sub: true,
                  },
                },
              },
              furrykill_zhuirenx: {
                viewAs: { name: "sha", zhuiren: true },
                filterCard: function (card) {
                  return get.itemtype(card) == 'card';
                },
                selectCard: 1,
                position: 'h',
                popname: true,
              },

              furrykill_xuenu: {
                init: function (player) {
                  player.storage.furrykill_xuenu = false;
                },
                unique: true,
                trigger: { player: "phaseUseBegin" },
                skillAnimation: true,
                animationColor: "orange",
                limited: true,
                filter: function (event, player) {
                  return !player.storage.furrykill_xuenu && !player.isHealthy();
                },
                content: function () {
                  player.awakenSkill('furrykill_xuenu');
                  player.storage.furrykill_xuenu = true;
                  var equipCount = player.countCards('e');
                  player.draw(equipCount);
                  player.disableEquip('equip1');
                  player.disableEquip('equip2');
                  player.disableEquip('equip3');
                  player.disableEquip('equip4');
                  player.disableEquip('equip5');
                  player.addTempSkill('furrykill_xuenu1');
                },
                ai: {
                  order: 13,
                  result: {
                    player: function (player) {
                      var trick = player.countCards('h', function (card) {
                        return get.type(card) == "trick";
                      });
                      var equip = player.countCards('e');
                      if (trick >= 3 || equip >= 4) return 1;
                      return -1;
                    },
                  },
                },
              },
              furrykill_xuenu1: {
                charlotte: true,
              },

              furrykill_xunmei: {
                trigger: {
                  player: "showCharacterAfter",
                },
                hiddenSkill: true,
                filter: function (event, player) {
                  return event.toShow.contains('furrykill_qinhan');
                },
                content: function () {
                  'step 0';
                  event.cards = game.cardsGotoOrdering(get.cards(4)).cards;
                  player.showCards(event.cards);
                  'step 1';
                  for (var i = 0; i < event.cards.length; i++) {
                    if (get.suit(event.cards[i]) != 'club') {
                      event.cards.remove(event.cards[i])
                      i--;
                    }
                  }
                  'step 2';
                  if (event.cards.length != 0) {
                    player.gain(event.cards, 'gain2', 'log');
                  }
                },
              },

              furrykill_luoxue: {
                init: function (player) {
                  player.storage.furrykill_luoxue1 = null;
                  player.storage.furrykill_luoxue = false;
                },
                enable: "phaseUse",
                usable: 1,
                filter: function (event, player) {
                  return player.countCards('he', { suit: 'club' });
                },
                position: "he",
                filterCard: {
                  suit: "club",
                },
                filterTarget: function () {
                  return true;
                },
                check: function (card) {
                  return 7 - get.value(card);
                },
                content: function () {
                  player.storage.furrykill_luoxue1 = target;
                  target.damage();
                },
                group: ["furrykill_luoxue_1", "furrykill_luoxue_2", "furrykill_luoxue_3"],
                subSkill: {
                  1: {
                    trigger: {
                      player: "phaseJieshuBegin",
                    },
                    forced: true,
                    filter: function (event, player) {
                      return player.storage.furrykill_luoxue;
                    },
                    content: function () {
                      player.storage.furrykill_luoxue = false;
                      player.insertPhase();
                    },
                  },
                  2: {
                    trigger: {
                      global: "dieAfter",
                    },
                    forced: true,
                    charlotte: true,
                    filter: function (event, player) {
                      return player.storage.furrykill_luoxue1 == event.player;
                    },
                    content: function () {
                      player.storage.furrykill_luoxue1 = null;
                      player.storage.furrykill_luoxue = true;
                    },
                  },
                  3: {
                    trigger: {
                      player: "phaseJieshuAfter",
                    },
                    popup: false,
                    forced: true,
                    charlotte: true,
                    content: function () {
                      player.storage.furrykill_luoxue1 = null;
                    },
                  }
                },
                ai: {
                  expose: 0.5,
                  order: 9.1,
                  threaten: 2,
                  result: {
                    target: function (player, target) {
                      return -5;
                    },
                  },
                },
              },

              furrykill_tanying: {
                trigger: {
                  global: "phaseUseEnd",
                },
                frequent: true,
                filter: function (event, player) {
                  if (player == event.player) return false;

                  var events = event.player.getHistory('useCard', function (ev) {
                    return ev.getParent('phaseUse') == event
                  });
                  if (events.length == 0) return false;
                  var card = events[events.length - 1].card;
                  if (get.suit(card) != 'club') return false;

                  var filterCard = function (c) {
                    return c.name == card.name
                      && get.suit(c) == get.suit(card)
                      && get.number(c) == get.number(card);
                  };
                  var filterPlayer = game.filterPlayer(function (current) {
                    return current.hasCard(filterCard, 'ej');
                  });

                  if (filterPlayer.length == 0) {
                    var fromDiscard = null;
                    for (var i = ui.discardPile.childNodes.length - 1; i >= 0; i--) {
                      if (filterCard(ui.discardPile.childNodes[i])) {
                        fromDiscard = ui.discardPile.childNodes[i];
                        break;
                      }
                    }
                    if (fromDiscard == null) {
                      return false;
                    } else {
                      player.storage.furrykill_tanying_fromPlayer = null;
                      player.storage.furrykill_tanying_gainCard = fromDiscard;
                    }
                  } else {
                    player.storage.furrykill_tanying_fromPlayer = filterPlayer[0];
                    var found = null;
                    game.findPlayer(function (current) {
                      var ej = current.getCards('ej');
                      for (var i = 0; i < ej.length; i++) {
                        if (filterCard(ej[i])) {
                          found = ej[i];
                          return true;
                        }
                      }
                    });
                    player.storage.furrykill_tanying_gainCard = found;
                  }
                  return true;
                },
                content: function () {
                  if (player.storage.furrykill_tanying_fromPlayer != null) {
                    player.gain(player.storage.furrykill_tanying_gainCard,
                      player.storage.furrykill_tanying_fromPlayer, 'gain2', 'log');
                  } else {
                    player.gain(player.storage.furrykill_tanying_gainCard, 'gain2', 'log');
                  }
                },
              },

              furrykill_mingxue: {
                trigger: {
                  player: "showCharacterAfter",
                },
                forced: true,
                hiddenSkill: true,
                filter: function (event, player) {
                  return event.toShow.contains('furrykill_lanyuan')
                    && player != _status.currentPhase
                    && player.countCards('h') - player.countMingzhiCard() > 0;
                },
                check: function (card) {
                  if (get.name(card) == "sha" ||
                    (get.type(card) == "trick" && get.tag({ name: card.name }, "damage"))) {
                    return 5 + get.value(card)
                  }
                  return 8 - get.value(card);
                },
                content: function () {
                  'step 0';
                  player.chooseCardToMingzhi(1, true, '明雪：明置一张牌');
                  'step 1';
                  event.card = { name: result.cards[0].name, isCard: true };
                  var cardType = get.type(event.card);
                  if (cardType != 'basic' && cardType != 'trick') {
                    event.finish();
                  }
                  if (event.card.name == "shan" || !player.hasUseTarget(event.card)) {
                    event.finish();
                  }
                  player.chooseUseTarget(event.card, get.prompt('furrykill_mingxue'),
                    '视为使用一张【' + get.translation(event.card.name) + '】', false);
                },
              },

              furrykill_shuangci: {
                trigger: {
                  player: "useCardToTarget",
                },
                filter: function (event, player) {
                  if (event.card.name != 'sha') return false;
                  return player.storage.mingzhi;
                },
                check: function (event, player) {
                  return -get.attitude(player, event.target);
                },
                content: function () {
                  'step 0';
                  var count = trigger.target.countDifferentCard('he');
                  var dropCount = Math.min(player.storage.mingzhi.length, 3);

                  if (count < dropCount) event.goto(2);

                  var next = trigger.target.chooseToDiscard('霜刺：弃置' + dropCount + '种类别的牌各一张，否则此杀不可被响应。',
                    dropCount, lib.filter.filterDifferentTypes, 'he', false);
                  next.set('num', num);
                  next.set('complexCard', true);
                  next.set('ai', function (card) {
                    return 9 - get.value(card);
                  });
                  'step 1';
                  if (result.bool) {
                    event.finish();
                  }
                  'step 2';
                  trigger.directHit.addArray(game.players);
                },
                mod: {
                  globalFrom: function (from, to, distance) {
                    if (from.storage.mingzhi) return distance - from.storage.mingzhi.length;
                    return distance;
                  },
                },
              },

              furrykill_hanlv: {
                enable: "phaseUse",
                usable: 1,
                filter: function (event, player) {
                  return player.countCards('h') - player.countMingzhiCard() > 0;
                },
                position: "h",
                selectCard: [1, 2],
                discard: false,
                lose: false,
                delay: false,
                filterCard: function (card, player) {
                  return !lib.filter.filterMingzhiCard(player, card);
                },
                check: function (card) {
                  return 8 - get.value(card);
                },
                content: function () {
                  player.mingzhiCard(event.cards);
                },
                group: ['furrykill_hanlv_1'],
                subSkill: {
                  1: {
                    trigger: {
                      player: "phaseJieshuBegin",
                    },
                    filter: function (event, player) {
                      var handCard = player.countCards('h');
                      return handCard != 0 && handCard == player.countMingzhiCard();
                    },
                    content: function () {
                      player.draw();
                    },
                  }
                }
              },

              furrykill_xunzhou: {
                forced: true,
                trigger: {
                  global: [
                    "cardsDiscardAfter",
                    "loseAfter",
                  ],
                },
                filter: function (event, player) {
                  var parentName = event.getParent().name;

                  if (event.card && get.position(event.card, true) != 'd') return false;
                  if (event.cards && get.position(event.cards[0], true) != 'd') return false;

                  var lingshi = event.getParent('furrykill_lingshi');
                  if (lingshi && lingshi.name == "furrykill_lingshi") return false;

                  if (event.name == 'cardsDiscard' && parentName == 'orderingDiscard') {
                    var p = event.getParent();
                    if (p.card && get.position(p.card, true) != 'd') return false;
                    if (p.cards && get.position(p.cards[0], true) != 'd') return false;
                    if (p.relatedEvent
                      && (p.relatedEvent.name == 'useCard'
                        || p.relatedEvent.name == 'discard'
                      )) {
                      return false;
                    }
                    //ol暴虐官方实现太拉了，做个特判
                    if (p.getParent().name == 'olbaolue' && get.suit(event.cards[0]) == 'spade') {
                      return false;
                    }
                  } else if (event.name == 'lose'
                    && (parentName == 'useCard'
                      || parentName == 'discard'
                    )) {
                    return false;
                  }

                  if (event.result && event.result.bool != null) {
                    return event.result.bool;
                  }
                  return true;
                },
                content: function () {
                  var cards = [];
                  if (trigger.cards2 && trigger.cards2.length > 0) {
                    cards = cards.concat(trigger.cards2);
                  } else if (trigger.cards) {
                    cards = cards.concat(trigger.cards);
                  }
                  if (trigger.card1) {
                    cards.add(trigger.card1);
                  }
                  if (trigger.card2) {
                    cards.add(trigger.card2);
                  }
                  if (trigger.orderingCards) {
                    cards = cards.concat(trigger.orderingCards);
                  }
                  player.addToExpansion(cards, 'gain2', 'log').gaintag.add('furrykill_xunzhou');
                },
                onremove: function (player, skill) {
                  var cards = player.getExpansions(skill);
                  if (cards.length) player.loseToDiscardpile(cards);
                },
                marktext: "挚",
                intro: {
                  content: "expansion",
                  markcount: "expansion",
                },
              },

              furrykill_tansu: {
                enable: "phaseUse",
                usable: 1,
                content: function () {
                  'step 0';
                  var zhiCount = player.getExpansions('furrykill_xunzhou').length;
                  if (zhiCount == 0) {
                    event.goto(4);
                  } else {
                    var list = ["从牌堆发现", "从【挚】中发现"];
                    player.chooseControl(list, true, function () {

                      if (zhiCount <= 3) {
                        var zhi = player.getExpansions('furrykill_xunzhou');
                        if (zhi.filter(c => {
                          c.name == 'lebu' || c.name == 'wuzhong' || c.name == 'bingliang'
                        }).length > 0) {
                          return "从【挚】中发现";
                        }
                      }

                      if (zhiCount < 10) return "从牌堆发现";
                      var mod10 = zhiCount % 10;
                      if (mod10 <= 2) return "从【挚】中发现";
                      return "从牌堆发现";
                    }).set('prompt', get.prompt2('furrykill_tansu'));
                  }
                  'step 1';
                  if (result.control == "从牌堆发现") {
                    event.goto(4);
                  } else {
                    var cards = player.getExpansions('furrykill_xunzhou');
                    if (cards.length > 3) cards = cards.randomGets(3)
                    var next = player.furrykillDiscoverCard('探溯：发现一张牌', cards, true);
                  }
                  'step 2';
                  var card = result.card;
                  player.gain(card, "draw");
                  game.log(player, '从【挚】中发现了', card);
                  'step 3';
                  event.finish();
                  'step 4';
                  var cards = get.cards(3);
                  if (cards.length == 0) event.finish();
                  var next = player.furrykillDiscoverCard('探溯：发现一张牌', cards, true);
                  next.set("gotoOrdering", true);
                  "step 5";
                  var card = result.card;
                  player.gain(card, "draw");
                  game.log(player, '从牌堆发现了', card);
                },
                ai: {
                  order: 10,
                  threaten: 1,
                },
              },

              furrykill_lingshi: {
                trigger: { global: "phaseAfter" },
                locked: true,
                forced: true,
                filter: function (event, player) {
                  var xunzhou = player.getExpansions('furrykill_xunzhou').length;
                  return xunzhou != 0 && xunzhou % 10 == 0;
                },
                content: function () {
                  player.loseToDiscardpile(player.getExpansions('furrykill_xunzhou'));
                  player.insertPhase();
                }
              },

              furrykill_wuzhu: {
                global: 'furrykill_wuzhu_global',
                subSkill: {
                  global: {
                    enable: "phaseUse",
                    direct: true,
                    delay: false,
                    filter: function (event, player) {
                      return !player.hasSkill('furrykill_wuzhu_used') && game.hasPlayer(function (current) {
                        return current.hasSkill('furrykill_wuzhu');
                      });
                    },
                    content: function () {
                      "step 0";
                      var targets = game.filterPlayer(function (current) {
                        return current.hasSkill('furrykill_wuzhu');
                      });
                      if (targets.length == 1) {
                        event.target = targets[0];
                        event.goto(2);
                      }
                      else if (targets.length > 0) {
                        player.chooseTarget(true, '选择【乌珠】的目标', function (card, player, target) {
                          return _status.event.list.contains(target);
                        }).set('list', targets).set('ai', function (target) {
                          var player = _status.event.player;
                          return get.attitude(player, target);
                        });
                      }
                      else {
                        event.finish();
                      }
                      "step 1";
                      if (result.bool && result.targets.length) {
                        event.target = result.targets[0];
                      }
                      else {
                        event.finish();
                      }
                      "step 2";
                      if (event.target) {
                        player.logSkill('furrykill_wuzhu', event.target);
                        player.addTempSkill('furrykill_wuzhu_used', 'phaseUseEnd');
                        event.card = cards[0];

                        player.loseHp();
                        event.target.draw(2);

                        if (player == event.target) {
                          event.finish();
                        }
                      }
                      else {
                        event.finish();
                      }
                      "step 3";
                      event.target.chooseCard('he', [1, 2], true, '乌珠：将一至两张牌交给' + get.translation(player));
                      "step 4";
                      if (result.bool) {
                        event.target.give(result.cards, player, true);
                      }
                    },
                    ai: {
                      order: 10,
                      threaten: 1,
                      result: {
                        player: function (player, target) {
                          var target = game.findPlayer(function (current) {
                            return current.hasSkill('furrykill_wuzhu');
                          });
                          if (player.hp == 1) return -10;
                          if (target) {
                            return get.attitude(player, target);
                          }
                        }
                      }
                    },
                    sub: true,
                  },
                  used: {
                    charlotte: true,
                    sub: true,
                  }
                },
              },

              furrykill_qunchong: {
                init: function (player) {
                  player.storage.furrykill_qunchong = 0;
                },
                enable: 'phaseUse',
                usable: 1,
                filter: function (event, player) {
                  return player.getHandcardLimit() > 0;
                },
                selectCard: function () {
                  return [Math.max(1, ui.selected.targets.length), game.countPlayer()];
                },
                selectTarget: function () {
                  return ui.selected.cards.length;
                },
                filterTarget: function (card, player, target) {
                  return !target.isHealthy();
                },
                position: 'he',
                filterCard: true,
                content: function () {
                  'step 0';
                  if (!player.hasSkill('furrykill_qunchong_used')) {
                    player.addTempSkill('furrykill_qunchong_used');
                    if (targets.length != player.getHandcardLimit()) {
                      player.storage.furrykill_qunchong++;
                      player.markSkill('furrykill_qunchong');
                    }
                  }
                  'step 1';
                  target.recover();
                },
                ai: {
                  order: 9,
                  threaten: 3,
                  result: {
                    player: function (player, target) {
                      if (player == target) return 10;
                      return get.attitude(player, target);
                    }
                  }
                },
                intro: {
                  content: '手牌上限-#',
                },
                mod: {
                  maxHandcard: function (player, num) {
                    return num - player.storage.furrykill_qunchong;
                  }
                },
                subSkill: {
                  used: {
                    charlotte: true,
                    sub: true,
                  }
                },
              },

              furrykill_yongdai: {
                init: function (player) {
                  player.storage.furrykill_yongdai_give = [];
                  player.storage.furrykill_yongdai_ungive = [];
                },
                trigger: {
                  player: "phaseUseBegin",
                },
                filter: function (event, player) {
                  return player.countCards('h') > 0;
                },
                content: function () {
                  'step 0';
                  player.showHandcards();
                  'step 1';
                  player.chooseTarget("拥戴：指定至多三名其他角色，这些角色选择是否交给你一张牌。", [1, 3], true, function (card, player, target) {
                    return player != target;
                  }, function (target) {
                    return get.attitude(player, target);
                  });
                  'step 2';
                  if (result.bool) {
                    event.num = 0;
                    event.targets = result.targets;
                    player.addTempSkill('furrykill_yongdai_after');
                  } else {
                    event.finish();
                  }
                  'step 3';
                  event.targets[event.num].chooseCard('he', 1, '拥戴：是否交给' + get.translation(player) + '一张牌?').ai = function (card) {
                    if (get.attitude(event.targets[event.num], player) > 0) {
                      if (get.name(card) == "sha" ||
                        (get.type(card) == "trick" && get.tag({ name: card.name }, "damage"))) {
                        return 5 + get.value(card)
                      }
                      return 8 - get.value(card);
                    }
                    return 2 - get.value(card);
                  };
                  'step 4';
                  if (result.bool) {
                    event.targets[event.num].give(result.cards, player, true);
                    player.storage.furrykill_yongdai_give.add(event.targets[event.num]);
                  } else {
                    player.storage.furrykill_yongdai_ungive.add(event.targets[event.num]);
                    game.log(event.targets[event.num], '选择不交给', player, '牌');
                  }
                  'step 5';
                  event.num++;
                  if (event.num != targets.length) event.goto(3);
                },
                ai: {
                  threaten: 3,
                },
                subSkill: {
                  after: {
                    trigger: {
                      player: "phaseUseAfter",
                    },
                    forced: true,
                    charlotte: true,
                    content: function () {
                      "step 0";
                      event.damaged = player.getStat('damage') > 0;
                      event.num = 0;
                      event.gives = player.storage.furrykill_yongdai_give;
                      event.ungives = player.storage.furrykill_yongdai_ungive;
                      if (event.gives.length == 0) event.goto(3);
                      "step 1";
                      if (event.damaged) {
                        event.gives[event.num].draw();
                      } else {
                        event.gives[event.num].chooseToDiscard(true, 'he');
                      }
                      event.num++;
                      if (event.num != event.gives.length) event.redo();
                      "step 2";
                      event.num = 0;
                      if (event.ungives.length == 0) event.goto(4);
                      "step 3";
                      if (!event.damaged) {
                        event.ungives[event.num].draw();
                      } else {
                        event.ungives[event.num].chooseToDiscard(true, 'he');
                      }
                      event.num++;
                      if (event.num != event.ungives.length) event.redo();
                      "step 4";
                      player.storage.furrykill_yongdai_give = [];
                      player.storage.furrykill_yongdai_ungive = [];
                    },
                    sub: true,
                  },
                },
              },

              furrykill_jiyin: {
                trigger: {
                  source: "damageSource",
                },
                frequent: true,
                popup: false,
                filter: function (event, player) {
                  return !player.hasSkill('furrykill_jiyin_used');
                },
                content: function () {
                  'step 0';
                  var list = ["令至多两名角色分别弃置一张牌", "令该角色攻击范围内的一名角色失去一点体力", "取消"];
                  player.chooseControl().set('choiceList', list).set('ai', function () {
                    return 0;
                  });
                  'step 1';
                  if (result.index == 2) {
                    event.finish();
                  } else if (result.index == 0) {
                    player.chooseTarget("激音：令至多两名角色分别弃置一张牌。", [1, 2], function (card, player, target) {
                      return target.countCards('he') > 0;
                    }, function (target) {
                      return -get.attitude(player, target);
                    });
                  } else {
                    event.goto(5);
                  }
                  'step 2';
                  if (result.bool) {
                    event.num = 0;
                    event.targets = result.targets;
                    player.addTempSkill('furrykill_jiyin_used');
                    player.logSkill('furrykill_jiyin');
                  } else {
                    event.goto(0);
                  }
                  'step 3';
                  event.targets[event.num].chooseToDiscard("激音：弃一张牌。", 'he', true);
                  'step 4';
                  event.num++;
                  if (event.num != targets.length) event.goto(3);
                  else event.finish();
                  'step 5';
                  player.chooseTarget("激音：令该角色攻击范围内的一名角色失去一点体力。", function (card, player, target) {
                    var source = trigger.player;
                    return target != source && source.inRange(target);
                  }).set('ai', function (target) {
                    return get.damageEffect(target, player, player);
                  });
                  'step 6';
                  if (result.bool && result.targets && result.targets.length) {
                    player.addTempSkill('furrykill_jiyin_used');
                    player.logSkill('furrykill_jiyin');
                    result.targets[0].loseHp();
                  } else {
                    event.goto(0);
                  }
                },
                subSkill: {
                  used: {
                    charlotte: true,
                    sub: true,
                  }
                }
              },

              furrykill_qingquan: {
                trigger: {
                  player: "damageEnd",
                },
                frequent: true,
                popup: false,
                filter: function (event, player) {
                  return !player.hasSkill('furrykill_qingquan_used');
                },
                content: function () {
                  'step 0';
                  var list = ["令至多两名角色分别摸一张牌", "令攻击范围内的一名其他角色恢复一点体力", "取消"];
                  player.chooseControl().set('choiceList', list).set('ai', function () {
                    return 0;
                  });
                  'step 1';
                  if (result.index == 2) {
                    event.finish();
                  } else if (result.index == 0) {
                    player.chooseTarget("清泉：令至多两名角色分别摸一张牌。", [1, 2], function (card, player, target) {
                      return true;
                    }, function (target) {
                      if (player == target) return 10;
                      return get.attitude(player, target);
                    });
                  } else {
                    event.goto(3);
                  }
                  'step 2';
                  if (result.bool) {
                    game.asyncDraw(result.targets);
                    player.addTempSkill('furrykill_qingquan_used');
                    player.logSkill('furrykill_qingquan');
                    event.finish();
                  } else {
                    event.goto(0);
                  }
                  'step 3';
                  player.chooseTarget("清泉：令攻击范围内的一名其他角色恢复一点体力。", function (card, player, target) {
                    return target != player && player.inRange(target);
                  }).set('ai', function (target) {
                    if (target == player) {
                      if (player.hp == 1) return 5;
                      else return 2;
                    }
                    return get.attitude(player, target);
                  });
                  'step 4';
                  if (result.bool && result.targets && result.targets.length) {
                    player.addTempSkill('furrykill_qingquan_used');
                    player.logSkill('furrykill_qingquan');
                    result.targets[0].recover();
                  } else {
                    event.goto(0);
                  }
                },
                subSkill: {
                  used: {
                    charlotte: true,
                    sub: true,
                  }
                },
                ai: {
                  maixie: true,
                },
              },

              furrykill_xiaoxue: {
                trigger: {
                  global: "useCardAfter",
                },
                direct: true,
                filter: function (event, player) {
                  if (player == _status.currentPhase) return false;
                  if (player.hasSkill('furrykill_xiaoxue_used')) return false;
                  var type = get.type(event.card);
                  if (type != "trick" && type != 'basic') return false;
                  if (event.cards.filterInD().length == 0) return false;
                  if (!player.storage.mingzhi && player.countCards('h') > 0) return true;
                  if (player.storage.mingzhi.some(m => get.type(m) == type)) return false;
                  return player.countCards('h') - player.countMingzhiCard() > 0;
                },
                content: function () {
                  'step 0';
                  var type = get.type(trigger.card);
                  var name = trigger.card.name;
                  var value = get.value(trigger.card);
                  player.chooseToDiscard('h', '效学：弃置一张与' + get.translation(trigger.card) + '类别相同、牌名不同的暗置牌，获得此牌并明置。',
                    1, function (card) {
                      if (player.storage.mingzhi && player.storage.mingzhi.contains(card)) return false;
                      return get.type(card) == type && card.name != name;
                    }).set('ai', function (card) {
                      return value - get.value(card);
                    });
                  'step 1';
                  if (result.bool) {
                    player.addTempSkill('furrykill_xiaoxue_used');
                    player.logSkill('furrykill_xiaoxue');

                    event.gainCards = trigger.cards.filterInD();

                    player.gain(event.gainCards, 'gain2', 'log');
                  } else {
                    event.finish();
                  }
                  'step 2';
                  player.mingzhiCard(event.gainCards);
                },
                subSkill: {
                  used: {
                    charlotte: true,
                    sub: true,
                  }
                }
              },

              furrykill_chengming: {
                init: function (player) {
                  player.storage.furrykill_chengming_lose = [];
                },
                mark: true,
                locked: true,
                forced: true,
                zhuanhuanji: true,
                marktext: "☯",
                intro: {
                  content: function (storage, player, skill) {
                    var str = !player.storage.furrykill_chengming
                      ? "你的暗置牌因弃置进入弃牌堆后，你摸一张牌。"
                      : "你使用明置的牌后，摸一张牌。";
                    return str;
                  },
                },
                group: ["furrykill_chengming_0", "furrykill_chengming_1", "furrykill_chengming_2", "furrykill_chengming_3"],
                subSkill: {
                  0: {
                    forced: true,
                    priority: 1,
                    trigger: { player: "loseEnd" },
                    filter: function (event, player) {
                      if (player.storage.furrykill_chengming) return false;
                      if (event.type != 'discard') return false;

                      player.storage.furrykill_chengming_lose = [];

                      if (!player.storage.mingzhi) {
                        player.storage.furrykill_chengming_lose = player.storage.furrykill_chengming_lose.concat(event.cards);
                        return false;
                      }

                      for (var i = 0; i < event.cards.length; i++) {
                        if (!player.storage.mingzhi.contains(event.cards[i])) {
                          player.storage.furrykill_chengming_lose.add(event.cards[i]);
                        }
                      }
                      return false;
                    },
                  },
                  1: {
                    prompt2: "你的暗置牌因弃置进入弃牌堆后，你摸一张牌。",
                    trigger: { player: "loseAfter" },
                    audio: 2,
                    forced: true,
                    filter: function (event, player) {
                      if (player.storage.furrykill_chengming) return false;
                      if (event.type != 'discard') return false;
                      var lose = player.storage.furrykill_chengming_lose.concat();
                      for (var i = 0; i < lose.length; i++) {
                        if (get.position(lose[i], true) != 'd')
                          player.storage.furrykill_chengming_lose.remove(lose[i]);
                      }
                      if (player.storage.furrykill_chengming_lose.length == 0) return false;
                      return true;
                    },
                    content: function () {
                      player.draw();
                      player.storage.furrykill_chengming_lose = [];
                      player.changeZhuanhuanji("furrykill_chengming");
                      player.markSkill("furrykill_chengming");
                    },
                    sub: true,
                  },
                  2: {
                    prompt2: "你使用明置的牌后，摸一张牌。",
                    trigger: { player: "useCardAfter" },
                    audio: 2,
                    forced: true,
                    filter: function (event, player) {
                      if (!player.storage.furrykill_chengming) return false;
                      if (player.storage.furrykill_chengming_lose.length == 0) return false;
                      return true;
                    },
                    content: function () {
                      player.draw();
                      player.storage.furrykill_chengming_lose = [];
                      player.changeZhuanhuanji("furrykill_chengming");
                      player.markSkill("furrykill_chengming");
                    },
                    sub: true,
                  },
                  3: {
                    forced: true,
                    priority: 105,
                    trigger: { player: "loseEnd" },
                    filter: function (event, player) {
                      if (!player.storage.furrykill_chengming) return false;
                      if (event.type != 'use') return false;
                      if (!player.storage.mingzhi) return false;

                      player.storage.furrykill_chengming_lose = [];

                      for (var i = 0; i < event.cards.length; i++) {
                        if (player.storage.mingzhi.contains(event.cards[i])) {
                          player.storage.furrykill_chengming_lose.add(event.cards[i]);
                          return false;
                        }
                      }
                      return false;
                    },
                  },
                }
              },

              furrykill_canghai: {
                trigger: {
                  player: "phaseUseBegin",
                },
                content: function () {
                  player.draw(2);
                  player.addTempSkill('furrykill_canghai2');
                },
              },
              furrykill_canghai2: {
                init: function (player) {
                  player.storage.furrykill_canghai = [];
                },
                trigger: { player: 'useCard' },
                forced: true,
                filter: function (event, player) {
                  var type = get.type(event.card, 'trick');
                  return !player.storage.furrykill_canghai.contains(type);
                },
                content: function () {
                  var type = get.type(trigger.card, 'trick');
                  if (!player.storage.furrykill_canghai.contains(type)) {
                    player.storage.furrykill_canghai.add(type);
                  }
                  if (player.countCards('he') == 0) {
                    event.finish();
                  } else {
                    player.chooseToDiscard(true, 'he', function (card) {
                      return card != trigger.card;
                    });
                  }
                },
                onremove: function (player) {
                  delete player.storage.furrykill_canghai;
                }
              },

              furrykill_juanren: {
                trigger: { player: "loseAfter" },
                audio: 2,
                forced: true,
                popup: false,
                filter: function (event, player) {
                  if (event.type != 'discard') return false;
                  return true;
                },
                content: function () {
                  player.storage.furrykill_juanren += trigger.cards2.length;
                },
                group: ['furrykill_juanren_before', 'furrykill_juanren_damage'],
                subSkill: {
                  before: {
                    trigger: {
                      global: "phaseBefore",
                    },
                    direct: true,
                    content: function () {
                      player.storage.furrykill_juanren = 0;
                    },
                    sub: true,
                  },
                  damage: {
                    trigger: {
                      global: "phaseEnd",
                    },
                    direct: true,
                    content: function () {
                      "step 0";
                      if (player.storage.furrykill_juanren < 3) {
                        event.goto(3);
                      }
                      "step 1";
                      player.chooseTarget(get.prompt('furrykill_juanren')).ai = function (target) {
                        var bool = get.attitude(player, target) > 0;
                        return get.damageEffect(target, player, player) - (bool ? 1 : 0);
                      };
                      "step 2";
                      if (result.bool) {
                        var target = result.targets[0];
                        player.logSkill('furrykill_juanren', target);
                        target.damage();
                      }
                      "step 3";
                      player.storage.furrykill_juanren = 0;
                    },
                    ai: {
                      threaten: 1.2,
                      expose: 0.3,
                    },
                    sub: true,
                  }
                }
              },

              furrykill_yanfan: {
                trigger: {
                  player: "damageEnd",
                },
                direct: true,
                content: function () {
                  "step 0";
                  player.chooseTarget(get.prompt('furrykill_yanfan')).ai = function (target) {
                    var delta = target.countCards() - target.hp;
                    var bool = get.attitude(player, target) > 0;
                    if (delta != 0) {
                      if (bool) return -delta;
                      return delta;
                    }
                    return get.damageEffect(target, player, player) - (bool ? 1 : 0);
                  };
                  "step 1";
                  if (result.bool) {
                    var target = result.targets[0];

                    player.logSkill('furrykill_yanfan', target);
                    var delta = target.countCards() - target.hp;
                    if (delta == 0) {
                      target.damage('fire');
                    } else if (delta > 0) {
                      target.chooseToDiscard('h', true, delta);
                    } else {
                      if (delta < -5) delta = -5;
                      target.draw(-delta);
                    }
                  }
                },
                ai: {
                  maixie: true,
                },
              },

              furrykill_xueyue: {
                audio: 2,
                init: function (player) {
                  player.storage.furrykill_xueyue = false;
                },
                limited: true,
                unique: true,
                enable: "phaseUse",
                usable: 1,
                filterTarget: function (player, target) {
                  return true;
                },
                filter: function (event, player) {
                  if (player.storage.furrykill_xueyue == true) return false;
                  return true;
                },
                skillAnimation: true,
                animationColor: "thunder",
                content: function () {
                  'step 0';
                  player.awakenSkill('furrykill_xueyue');
                  player.storage.furrykill_xueyue = true;
                  player.damage();
                  'step 1';
                  if (player.isAlive()) {
                    target.addTempSkill('baiban', { player: 'phaseAfter' });
                  }
                },
                ai: {
                  expose: 0.5,
                  order: 9.1,
                  threaten: 2,
                  result: {
                    target: function (player, target) {
                      return -5;
                    },
                  },
                },
                mark: true,
                intro: {
                  content: "limited",
                },
              },

              furrykill_sanwei: {
                init: function (player) {
                  player.storage.furrykill_sanwei_draw = false;
                  player.storage.furrykill_sanwei_sha = false;
                  player.storage.furrykill_sanwei_handMax = false;
                },
                audio: 2,
                trigger: {
                  global: "phaseBefore",
                  player: ["enterGame", "showCharacterAfter"],
                },
                forced: true,
                popup: false,
                filter: function (event, player) {
                  if (player._furrykill_sanwei) return false;
                  return (event.name != 'showCharacter') && (event.name != 'phase' || game.phaseNumber == 0);
                },
                content: function () {
                  player.addMark('furrykill_sanwei', 3);
                  player._furrykill_sanwei = true;
                },
                marktext: '镜',
                intro: {
                  name2: "镜",
                  content: "mark",
                },
                mod: {
                  maxHandcard: function (player, num) {
                    if (player.storage.furrykill_sanwei_handMax)
                      return num + 1;
                    return num - 1;
                  },
                  cardUsable: function (card, player, num) {
                    if (_status.currentPhase == player && card.name == 'sha') {
                      if (player.storage.furrykill_sanwei_sha)
                        return num + 1;
                      return num - 1;
                    }
                  },
                },
                group: ['furrykill_sanwei_zhunbei', 'furrykill_sanwei_draw', 'furrykill_sanwei_recover'],
                subSkill: {
                  zhunbei: {
                    trigger: {
                      player: "phaseZhunbeiBegin",
                    },
                    direct: true,
                    content: function () {
                      'step 0';
                      event.jing = player.countMark('furrykill_sanwei');
                      if (event.jing == 3) {
                        player.storage.furrykill_sanwei_draw = true;
                        player.storage.furrykill_sanwei_sha = true;
                        player.storage.furrykill_sanwei_handMax = true;
                        player.logSkill('furrykill_sanwei');
                        event.finish();
                      } else {
                        var func = function (card, id, card2, card3) {
                          var list = [
                            '摸牌阶段的摸牌数',
                            '出牌阶段使用杀的次数',
                            '手牌上限',
                          ];
                          var choiceList = ui.create.dialog('三尾：请选择' + get.cnNumber(event.jing) + '项');
                          choiceList.videoId = id;
                          for (var i = 0; i < list.length; i++) {
                            var str = '<div class="popup text" style="width:calc(100% - 10px);display:inline-block">';
                            str += list[i];
                            str += '</div>';
                            var next = choiceList.add(str);
                            next.firstChild.addEventListener(lib.config.touchscreen ? 'touchend' : 'click', ui.click.button);
                            next.firstChild.link = i;
                            for (var j in lib.element.button) {
                              next[j] = lib.element.button[j];
                            }
                            choiceList.buttons.add(next.firstChild);
                          }
                          return choiceList;
                        };
                        if (player.isOnline2()) {
                          player.send(func, get.translation(trigger.source), event.videoId, get.translation(event.cardname), get.translation(trigger.player));
                        }
                        event.dialog = func(get.translation(trigger.source), event.videoId, get.translation(event.cardname), get.translation(trigger.player));
                        if (player != game.me || _status.auto) {
                          event.dialog.style.display = 'none';
                        }
                        var next = player.chooseButton();
                        next.set('dialog', event.videoId);
                        next.set('forced', true);
                        next.set('selectButton', event.jing);
                        next.set('ai', function (button) {
                          switch (button.link) {
                            case 0: return 3;
                            case 1: return 1;
                            case 2: return 2;
                          }
                        });
                      }
                      'step 1'
                      if (player.isOnline2()) {
                        player.send('closeDialog', event.videoId);
                      }
                      event.dialog.close();
                      event.links = result.links.sort();
                      for (var i of event.links) {
                        if (i == 0) {
                          player.storage.furrykill_sanwei_draw = true;
                        } else if (i == 1) {
                          player.storage.furrykill_sanwei_sha = true;
                        } else {
                          player.storage.furrykill_sanwei_handMax = true;
                        }

                        game.log(player, '选择了', '#g【三尾】', '的', '#y选项' + get.cnNumber(i + 1, true));
                      }
                    },
                    sub: true,
                  },
                  draw: {
                    audio: 2,
                    trigger: {
                      player: "phaseDrawBegin2",
                    },
                    direct: true,
                    content: function () {
                      if (player.storage.furrykill_sanwei_draw) {
                        trigger.num++;
                      } else {
                        trigger.num--;
                      }
                    },
                  },
                  recover: {
                    trigger: {
                      global: "phaseEnd",
                    },
                    direct: true,
                    content: function () {
                      player.storage.furrykill_sanwei_draw = false;
                      player.storage.furrykill_sanwei_sha = false;
                      player.storage.furrykill_sanwei_handMax = false;
                    },
                    sub: true,
                  },
                },
              },

              furrykill_ganlin: {
                trigger: {
                  global: "dying",
                },
                priority: 9,
                check: function (event, player) {
                  return get.attitude(player, event.player) > 0;
                },
                logTarget: "player",
                content: function () {
                  'step 0';
                  player.removeMark('furrykill_sanwei', 1);
                  'step 1';
                  var nowHp = trigger.player.hp;
                  trigger.player.recover(2 - nowHp);
                  'step 2';
                  if (player.countMark('furrykill_sanwei') == 0) {
                    player.die();
                  }
                },
              },

              furrykill_jixing: {
                init: function (player) {
                  player.storage.furrykill_cardUseLimit = [3, 0];
                },
                enable: "phaseUse",
                filterCard: function (card, player) {
                  return get.type(card, 'trick') == 'trick';
                },
                viewAs: {
                  name: "furrykill_jiasu",
                },
                viewAsFilter: function (player) {
                  if (!player.countCards('h')) return false;
                },
                prompt: "将锦囊牌当做加速使用（摸一张牌，此阶段你可以额外使用两张牌）",
                ai: {
                  order: 5,
                },
                group: ['furrykill_jixing_reset', 'furrykill_jixing_hidden', 'furrykill_jixing_count'],
                subSkill: {
                  reset: {
                    direct: true,
                    priority: 50,
                    trigger: {
                      player: "phaseUseBefore",
                    },
                    content: function () {
                      player.storage.furrykill_cardUseLimit = [3, 0];
                      player.markSkill("furrykill_cardUseLimit");
                    },
                  },
                  hidden: {
                    direct: true,
                    priority: 50,
                    trigger: {
                      player: "phaseUseAfter",
                    },
                    content: function () {
                      player.unmarkSkill("furrykill_cardUseLimit");
                    },
                  },
                  count: {
                    trigger: { player: 'useCard1' },
                    silent: true,
                    firstDo: true,
                    filter: function (event, player) {
                      return _status.currentPhase == player;
                    },
                    content: function () {
                      player.storage.furrykill_cardUseLimit[1]++;
                      player.markSkill("furrykill_cardUseLimit");
                    },
                    mod: {
                      cardEnabled2: function (card, player) {
                        if (_status.currentPhase == player
                          && player.storage.furrykill_cardUseLimit[1] >= player.storage.furrykill_cardUseLimit[0]) return false;
                      },
                    },
                  }
                }
              },

              furrykill_xiemu: {
                trigger: {
                  player: "phaseEnd",
                },
                frequent: true,
                filter: function (event, player) {
                  return player.countUsed(false, true) >= 4;
                },
                content: function () {
                  'step 0';
                  event.num = Math.floor(player.countUsed(false, true) / 4);
                  'step 1';
                  player.chooseTarget('谢幕', function (card, player, target) {
                    return true;
                  }).set('prompt2', '造成一点伤害').ai = function (target) {
                    return get.damageEffect(target, player, player);
                  }
                  'step 2';
                  if (result.bool) {
                    player.line(result.targets[0]);
                    result.targets[0].damage();
                  } else {
                    event.finish();
                  }
                  'step 3';
                  event.num--;
                  if (event.num > 0) event.goto(1);
                },
                ai: {
                  order: -10,
                  result: {
                    target: 2,
                  },
                  threaten: 1.5,
                },
              },

              furrykill_yvmo: {
                subSkill: {
                  fire: {
                    marktext: '🔥',
                    intro: {
                      name: '火',
                      content: 'mark',
                    },
                  },
                  water: {
                    marktext: '💧',
                    intro: {
                      name: '水',
                      content: 'mark',
                    },
                  },
                  wood: {
                    marktext: '🌿',
                    intro: {
                      name: '木',
                      content: 'mark',
                    },
                  },
                },
                forced: true,
                trigger: {
                  player: "useCardAfter",
                },
                filter: function (event, player) {
                  var type = get.type(event.card, 'trick');
                  if (type == 'trick' && !player.hasMark('furrykill_yvmo_fire')) return true;
                  else if (type == 'equip' && !player.hasMark('furrykill_yvmo_water')) return true;
                  else if (type == 'basic' && !player.hasMark('furrykill_yvmo_wood')) return true;
                  return false;
                },
                content: function () {
                  'step 0';
                  var type = get.type(trigger.card, 'trick');
                  if (type == 'trick') player.addMark('furrykill_yvmo_fire');
                  else if (type == 'equip') player.addMark('furrykill_yvmo_water');
                  else player.addMark('furrykill_yvmo_wood');
                  'step 1';
                  if (player.hasMark('furrykill_yvmo_fire')
                    && player.hasMark('furrykill_yvmo_water')
                    && player.hasMark('furrykill_yvmo_wood')
                    && !player.storage.furrykill_yinchang1) {
                    player.yinchang();
                    player.removeMark('furrykill_yvmo_fire');
                    player.removeMark('furrykill_yvmo_water');
                    player.removeMark('furrykill_yvmo_wood');
                  }
                },
                group: ['furrykill_yvmo2'],
              },
              furrykill_yvmo2: {
                trigger: {
                  player: "unyinchangAfter",
                },
                forced: true,
                filter: function (event, player) {
                  if (player.hasMark('furrykill_yvmo_fire')
                    && player.hasMark('furrykill_yvmo_water')
                    && player.hasMark('furrykill_yvmo_wood')) {
                    return true;
                  }
                  return false;
                },
                content: function () {
                  player.yinchang();
                  player.removeMark('furrykill_yvmo_fire');
                  player.removeMark('furrykill_yvmo_water');
                  player.removeMark('furrykill_yvmo_wood');
                },
              },

              furrykill_sanyuan: {
                init: function (player) {
                  player.storage.furrykill_sanyuan = 1;
                },
                mark: true,
                zhuanhuanji: true,
                marktext: "三元",
                intro: {
                  content: function (storage, player, skill) {
                    if (player.storage.furrykill_sanyuan == 1)
                      return '视为对其使用一张铁索连环并对其造成一点火焰伤害。';
                    if (player.storage.furrykill_sanyuan == 2)
                      return '获得其装备区里的一张牌并使用之。';
                    return '视为对其使用一张杀，若此杀造成伤害，你恢复一点体力。';
                  },
                },
                prompt2: function (event, player) {
                  if (player.storage.furrykill_sanyuan == 1)
                    return '视为对其使用一张铁索连环并对其造成一点火焰伤害。';
                  if (player.storage.furrykill_sanyuan == 2)
                    return '获得其装备区里的一张牌并使用之。';
                  return '视为对其使用一张杀，若此杀造成伤害，你恢复一点体力。';
                },
                trigger: {
                  global: "phaseZhunbeiBegin",
                },
                filter: function (event, player) {
                  if (player.storage.furrykill_sanyuan == 2
                    && event.player.countCards('e') == 0) {
                    return false;
                  }
                  return player != event.player && player.storage.furrykill_yinchang1;
                },
                content: function () {
                  "step 0";
                  if (player.storage.furrykill_sanyuan == 1) {
                    event.goto(4);
                  } else if (player.storage.furrykill_sanyuan == 2) {
                    event.goto(7);
                  }
                  "step 1";
                  player.storage.furrykill_sanyuan_sign = true
                  event.card = { name: 'sha', isCard: true };
                  event.related = player.useCard(event.card, trigger.player);
                  "step 2";
                  if (event.related && game.hasPlayer2(function (current) {
                    return current.getHistory('damage', function (evt) {
                      return evt.getParent(2) == event.related;
                    }).length > 0;
                  })) {
                    player.recover();
                  }
                  "step 3";
                  player.storage.furrykill_sanyuan = 1;
                  player.markSkill("furrykill_sanyuan");
                  player.unyinchang();
                  event.finish();
                  "step 4";
                  event.card = { name: 'tiesuo', isCard: true };
                  player.useCard(event.card, trigger.player);
                  "step 5";
                  player.line(trigger.player, 'fire');
                  trigger.player.damage('fire');
                  "step 6";
                  player.storage.furrykill_sanyuan = 2;
                  player.markSkill("furrykill_sanyuan");
                  player.unyinchang();
                  event.finish();
                  "step 7";
                  player.gainPlayerCard(trigger.player, 'e', true);
                  "step 8";
                  player.chooseUseTarget(result.cards[0], true, 'nopopup');
                  "step 9";
                  player.storage.furrykill_sanyuan = 3;
                  player.markSkill("furrykill_sanyuan");
                  player.unyinchang();
                },
              },

              furrykill_yuanli: {
                mod: {
                  maxHandcard: function (player, num) {
                    return num + 2;
                  }
                },
                trigger: {
                  player: "phaseJieshuBegin",
                },
                prompt2: "结束阶段，你可以转换一次三元。",
                content: function () {
                  var sanyuan = player.storage.furrykill_sanyuan + 1;
                  if (sanyuan > 3) sanyuan = 1;
                  player.storage.furrykill_sanyuan = sanyuan;
                  player.markSkill("furrykill_sanyuan");
                },
              },

              furrykill_qianmeng: {
                enable: "phaseUse",
                usable: 1,
                selectTarget: [1, 2],
                filterTarget: function (card, player, target) {
                  return player != target && player.countCards('he') > ui.selected.targets.length;
                },
                content: function () {
                  'step 0';
                  player.chooseCard(true, 'he', 1)
                    .set('prompt', '选择交给' + get.translation(target) + '的牌');
                  'step 1';
                  event.gainCard = result.cards[0];
                  target.gain(event.gainCard, 'give', player);
                  'step 2'
                  if (target.hasUseTarget(event.gainCard)) {
                    target.chooseUseTarget(false, event.gainCard, false).logSkill = 'furrykill_qianmeng';
                  }
                },
                ai: {
                  order: 9,
                  result: {
                    target: function (player, target) {
                      return 5;
                    },
                  },
                  threaten: 2,
                },
              },

              furrykill_zheyue: {
                trigger: { global: "useCardAfter" },
                direct: true,
                filter: function (event, player) {
                  if (_status.currentPhase == event.player) return false;
                  var type = get.type(event.card, 'trick');
                  if (type == 'trick' || event.card.name == 'sha') return true;
                  return false;
                },
                content: function () {
                  'step 0';
                  event.choice2 = '令' + get.translation(trigger.player) + '摸一张牌';
                  player.chooseControl('摸一张牌', event.choice2, 'cancel2', function () {
                    if (get.attitude(player, trigger.player) > 1.5) {
                      return event.choice2;
                    }
                    return '摸一张牌';
                  }).set('prompt', get.prompt2('furrykill_zheyue'));
                  'step 1';
                  if (result.control == 'cancel2') {
                    event.finish();
                  } else if (result.control == '摸一张牌') {
                    player.draw();
                    player.logSkill('furrykill_zheyue');
                  } else {
                    trigger.player.draw();
                    player.logSkill('furrykill_zheyue', trigger.player);
                  }
                },
                ai: {
                  expose: 0.1,
                },
              },

              furrykill_suqing: {
                init: function (player) {
                  player.storage.furrykill_suqing = false;
                  player.storage.furrykill_suqing2 = false;
                },
                trigger: { player: 'phaseUseBegin' },
                locked: function (skill, player) {
                  if (!player || !player.storage.furrykill_suqing) return true;
                  return false;
                },
                direct: true,
                prompt2: function (event, player) {
                  if (player.storage.furrykill_suqing) return '出牌阶段开始时，你可以选择一名角色，弃置其每个区域内的一张牌。此阶段结束时，若你未对其造成伤害，你失去一点体力。';
                  return '锁定技，出牌阶段开始时，你选择一名体力值不大于你的角色，然后弃置其每个区域内的一张牌。此回合结束时，若你未对其造成伤害，你失去一点体力。';
                },
                content: function () {
                  'step 0';
                  player.chooseTarget(!player.storage.furrykill_suqing,
                    function (card, player, target) {
                      return player.storage.furrykill_suqing || target.hp <= player.hp;
                    }
                  ).set('prompt', get.prompt('furrykill_suqing')).set('ai', function (target) {
                    return -get.attitude(player, target);
                  });
                  'step 1';
                  if (!result.bool) {
                    event.finish();
                  } else {
                    event.target = result.targets[0];
                    event.dropCards = [];
                    player.logSkill('furrykill_suqing', event.target);
                  }
                  'step 2';
                  if (event.target.countCards('h') > 0) {
                    event.bool = true;
                    player.choosePlayerCard(event.target, true, 'h',
                      "肃清：弃置" + get.translation(event.target) + "手牌区一张牌");
                  } else {
                    event.bool = false;
                  }
                  'step 3';
                  if (event.bool && result.bool) {
                    event.dropCards.push(result.cards[0]);
                  }
                  'step 4';
                  if (event.target.countCards('e') > 0) {
                    event.bool = true;
                    player.choosePlayerCard(event.target, true, 'e',
                      "肃清：弃置" + get.translation(event.target) + "装备区一张牌");
                  } else {
                    event.bool = false;
                  }
                  'step 5';
                  if (event.bool && result.bool) {
                    event.dropCards.push(result.cards[0]);
                  }
                  'step 6';
                  if (event.target.countCards('j') > 0) {
                    event.bool = true;
                    player.choosePlayerCard(event.target, true, 'j',
                      "肃清：弃置" + get.translation(event.target) + "判定区一张牌");
                  } else {
                    event.bool = false;
                  }
                  'step 7';
                  if (event.bool && result.bool) {
                    event.dropCards.push(result.cards[0]);
                  }
                  'step 8';
                  if (event.dropCards.length != 0) {
                    if (player != event.target)
                      player.storage.furrykill_suqing2 = true;
                    event.target.discard(event.dropCards);
                  }
                  'step 9';
                  player.storage.furrykill_suqing_order = event.target;
                  player.storage.furrykill_suqing_damage = true;
                  player.addTempSkill('furrykill_suqing_order');
                  player.addTempSkill('furrykill_suqing_damage');
                },
                subSkill: {
                  order: {
                    charlotte: true,
                    trigger: {
                      source: "damageAfter",
                    },
                    direct: true,
                    priority: 2,
                    filter: function (event, player) {
                      return player.storage.furrykill_suqing_order == event.player
                        && player.storage.furrykill_suqing_damage;
                    },
                    content: function () {
                      player.storage.furrykill_suqing_damage = false;
                    },
                    onremove: function (player, skill) {
                      player.storage.furrykill_suqing_order = undefined;
                    },
                    sub: true,
                  },
                  damage: {
                    direct: true,
                    trigger: { player: 'phaseEnd' },
                    filter: function (event, player) {
                      return player.storage.furrykill_suqing_damage;
                    },
                    content: function () {
                      player.loseHp();
                      player.logSkill('furrykill_suqing');
                    },
                    onremove: function (player, skill) {
                      player.storage.furrykill_suqing_damage = undefined;
                    },
                    sub: true,
                  }
                }
              },

              furrykill_shenfu: {
                skillAnimation: true,
                animationColor: 'thunder',
                unique: true,
                juexingji: true,
                audio: 2,
                trigger: { player: 'dying' },
                forced: true,
                filter: function (event, player) {
                  return !player.storage.furrykill_suqing;
                },
                content: function () {
                  "step 0";
                  player.loseMaxHp();
                  player.recover(2);
                  "step 1";
                  player.addSkill('furrykill_zhiguang');
                  player.storage.furrykill_suqing = true;
                  player.awakenSkill('furrykill_shenfu');
                  "step 2";
                  if (player.storage.furrykill_suqing2 == false) {
                    player.draw(4);
                    player.addSkill('furrykill_shenfu2');
                  }
                },
              },
              furrykill_shenfu2: {
                charlotte: true,
                mod: {
                  cardUsable: function (card, player, num) {
                    if (card.name == 'sha') return num + 1;
                  },
                },
              },

              furrykill_zhiguang: {
                mod: {
                  targetInRange: function (card, player, target) {
                    if (player.storage.furrykill_suqing_order == target) {
                      return true;
                    }
                  },
                },
                trigger: {
                  source: "damageAfter",
                },
                frequent: true,
                priority: 1,
                filter: function (event, player) {
                  if (player.storage.furrykill_suqing_order == undefined) return false;
                  return player.storage.furrykill_suqing_order == event.player;
                },
                content: function () {
                  player.draw();
                },
              },

              furrykill_enze: {
                trigger: {
                  player: "phaseBefore",
                },
                content: function () {
                  "step 0";
                  var list = ["开眼", "沟通", "献祭", '退缩'];

                  event.mozhen = player.getExpansions('furrykill_enze');
                  if (event.mozhen.length == 0) {
                    list.remove('沟通');
                    list.remove('退缩');
                  }
                  if (player.countCards('h') == 0) {
                    list.remove('沟通');
                    list.remove('献祭');
                  }

                  player.chooseControl(list, true, function () {
                    return "开眼";
                  }).set('prompt', '开眼，将牌堆顶的一张牌置入【魔阵】中，本回合你获得【真瞳】；</br>沟通，交换手牌和【魔阵】中的一张牌，本回合你获得【八爪】；</br>献祭，将一张手牌置入【魔阵】中，本回合你获得【秽咒】；</br>退缩，获得【魔阵】中的一张牌。');
                  "step 1";
                  if (result.control == "开眼") {
                    player.addToExpansion('furrykill_enze', get.cards()).gaintag.add('furrykill_enze');
                    player.addTempSkill('furrykill_quanneng1');
                    event.finish();
                  } else if (result.control == "沟通") {
                    player.addTempSkill('furrykill_quanneng2');
                    event.goto(3);
                  } else if (result.control == "献祭") {
                    player.addTempSkill('furrykill_quanneng3');
                    event.goto(6);
                  } else {
                    player.chooseButton(true, ['获得【魔阵】中的一张牌', event.mozhen])
                      .set('filterButton', function (button) {
                        return ui.selected.buttons.length == 0;
                      }).set('ai', function (button) {
                        return 10 - get.value(button.link);
                      }).set('cards', event.mozhen);
                  }
                  "step 2";
                  if (result.bool && result.links) {
                    player.gain(result.links);
                    event.finish();
                  }
                  "step 3";
                  player.chooseButton(true, ['选择【魔阵】中的一张牌', event.mozhen])
                    .set('filterButton', function (button) {
                      return ui.selected.buttons.length == 0;
                    }).set('ai', function (button) {
                      return 10 - get.value(button.link);
                    }).set('cards', event.mozhen);
                  "step 4";
                  if (result.bool && result.links) {
                    var card = result.links[0];
                    player.gain(card);
                    player.chooseCard('h', true, '选择一张作为交换的手牌', function (c) {
                      return card != c;
                    });
                  }
                  "step 5";
                  if (result.bool) {
                    var cs = result.cards;
                    player.addToExpansion('furrykill_enze', cs).gaintag.add('furrykill_enze');
                    event.finish();
                  }
                  "step 6";
                  player.chooseCard('h', true, '将一张手牌置入【魔阵】中');
                  "step 7";
                  if (result.bool) {
                    var cs = result.cards;
                    player.addToExpansion('furrykill_enze', cs).gaintag.add('furrykill_enze');
                  }
                },
                intro: {
                  content: 'expansion',
                  markcount: 'expansion',
                },
                marktext: '魔阵',
                onremove: function (player, skill) {
                  var cards = player.getExpansions("furrykill_enze");
                  if (cards.length) player.loseToDiscardpile(cards);
                },
              },

              furrykill_jianglin: {
                mode: ['identity', 'versus', 'doudizhu'],
                init: function (player) {
                  player.storage.furrykill_jianglin_kill = false;
                  player.storage.furrykill_jianglin_damage = 0;
                  player.storage.furrykill_jianglin = false;
                },
                skillAnimation: true,
                animationColor: 'thunder',
                unique: true,
                juexingji: true,
                audio: 2,
                trigger: { player: 'phaseEnd' },
                priority: 1,
                forced: true,
                filter: function (event, player) {
                  if (!player.storage.furrykill_jianglin_kill) return false;
                  if (player.storage.furrykill_jianglin_damage < 4) return false;
                  var cards = player.getExpansions("furrykill_enze");
                  if (cards.length != 4) return false;
                  var ary = [];
                  for (var i = 0; i < cards.length; i++) {
                    var suit = get.suit(cards[i]);
                    if (ary.contains(suit)) {
                      return false;
                    }
                    ary.push(suit);
                  }
                  return true;
                },
                content: function () {
                  "step 0";
                  player.init('furrykill_mingyu_evil');
                  player.update();
                  ui.clear();
                  "step 1";
                  player.discard(player.getCards('hej'));
                  "step 2";
                  player.draw(4);
                  player.addSkill("furrykill_quanneng_kill");
                  "step 3";
                  if (_status.mode == 'two') {
                    game.broadcastAll(function (player) {
                      game.countPlayer(function (current) {
                        if (current != player) {
                          current.side = false;
                        }
                      });
                      player.side = true;
                    }, player);
                    for (var i = 0; i < game.players.length; i++) {
                      if (game.players[i].side == game.me.side) {
                        game.players[i].node.identity.firstChild.innerHTML = '友';
                      }
                      else {
                        game.players[i].node.identity.firstChild.innerHTML = '敌';
                      }
                      game.players[i].node.identity.dataset.color = game.players[i].side + 'zhu';
                    }
                  } else {
                    game.broadcastAll(function (player) {
                      game.countPlayer(function (current) {
                        if (current.isZhu) {
                          delete current.isZhu;
                        }
                        if (current != player) {
                          current.identity = 'fan';
                          current.showIdentity();
                        }
                      });
                      player.identity = 'zhu';
                      game.zhu = player;
                      player.showIdentity();
                    }, player);
                    event.trigger('zhuUpdate');
                  }
                  "step 4";
                  while (_status.event.name != 'phaseLoop') {
                    _status.event = _status.event.parent;
                  }
                  _status.paused = false;
                  _status.event.player = player;
                  _status.event.step = 0;
                  if (game.bossinfo) {
                    game.bossinfo.loopType = 1;
                    _status.roundStart = game.boss;
                  }
                },
                group: ['furrykill_jianglin_kill', 'furrykill_jianglin_damage'],
                subSkill: {
                  kill: {
                    trigger: {
                      global: "die",
                    },
                    direct: true,
                    charlotte: true,
                    priority: 5,
                    filter: function (event, player) {
                      return event.source == player;
                    },
                    content: function () {
                      player.storage.furrykill_jianglin_kill = true;
                    },
                    sub: true,
                  },
                  damage: {
                    trigger: {
                      source: "damageAfter",
                    },
                    direct: true,
                    charlotte: true,
                    priority: 5,
                    filter: function (event, player) {
                      return player.storage.furrykill_jianglin_damage < 4;
                    },
                    content: function () {
                      player.storage.furrykill_jianglin_damage += trigger.num;
                    },
                    sub: true,
                  },
                }
              },

              furrykill_quanneng: {
                group: ['furrykill_quanneng1', 'furrykill_quanneng2', 'furrykill_quanneng3']
              },
              furrykill_quanneng1: {
                trigger: {
                  player: "phaseBegin",
                },
                prompt2: "准备阶段，你可以发现一张牌。",
                content: function () {
                  'step 0';
                  var cards = get.cards(3);
                  if (cards.length == 0) event.finish();
                  var next = player.furrykillDiscoverCard('真瞳：发现一张牌', cards, true);
                  next.set("gotoOrdering", true);
                  "step 1";
                  var card = result.card;
                  player.gain(card, "draw");
                  game.log(player, '从牌堆发现了', card);
                }
              },
              furrykill_quanneng2: {
                trigger: {
                  player: "useCardToTarget",
                },
                prompt2: "出牌阶段，你使用的黑色牌可以额外指定一个目标。",
                direct: true,
                filter: function (event, player) {
                  if (_status.currentPhase != player) return false;
                  var card = event.card;
                  var info = get.info(card);
                  if (get.color(card) != 'black') return false;
                  if (!event.isFirstTarget) return false;
                  if (info.allowMultiple == false) return false;
                  if (event.targets && !info.multitarget) {
                    if (game.hasPlayer(function (current) {
                      return !event.targets.contains(current) && lib.filter.targetEnabled2(event.card, event.player, current);
                    })) {
                      return true;
                    }
                  }
                  return false;
                },
                content: function () {
                  'step 0'
                  var prompt2 = '为' + get.translation(trigger.card) + '额外指定一名角色成为目标'
                  player.chooseTarget(get.prompt2('furrykill_quanneng2'), function (card, player, target) {
                    var player = _status.event.source;
                    return !_status.event.targets.contains(target) && lib.filter.targetEnabled2(_status.event.card, player, target);
                  }).set('prompt2', prompt2).set('ai', function (target) {
                    var trigger = _status.event.getTrigger();
                    var player = _status.event.source;
                    return get.effect(target, trigger.card, player, _status.event.player);
                  }).set('targets', trigger.targets).set('card', trigger.card).set('source', trigger.player);
                  'step 1'
                  if (result.bool) {
                    if (!event.isMine() && !event.isOnline()) game.delayx();
                    event.targets = result.targets;
                  }
                  else {
                    event.finish();
                  }
                  'step 2'
                  if (event.targets) {
                    player.logSkill('furrykill_quanneng2', event.targets);
                    trigger.targets.addArray(event.targets);
                    game.log(event.targets, '也成为了', trigger.card, '的目标');
                  }
                },
              },
              furrykill_quanneng3: {
                trigger: {
                  player: "phaseEnd",
                },
                direct: true,
                priority: 100,
                prompt2: "结束阶段，你可以造成一点伤害。",
                content: function () {
                  "step 0";
                  player.chooseTarget(get.prompt2('furrykill_quanneng3')).ai = function (target) {
                    var bool = get.attitude(player, target) > 0;
                    return get.damageEffect(target, player, player) - (bool ? 1 : 0);
                  };
                  "step 1";
                  var target = result.targets[0];
                  player.logSkill('furrykill_quanneng3', target);
                  target.damage();
                },
              },

              furrykill_quanneng_kill: {
                trigger: {
                  global: "die",
                },
                direct: true,
                charlotte: true,
                priority: 100,
                filter: function (event, player) {
                  return event.source == player && event.player != player;
                },
                content: function () {
                  'step 0';
                  if (get.mode() == 'identity') {
                    game.broadcastAll(function () {
                      trigger.player.identity = 'nei';
                      trigger.player.showIdentity();
                    });
                  }
                  player.draw(2);
                  'step 1';
                  if (game.countPlayer() == 1) {
                    if (_status.mode == 'two') {
                      game.over(true);
                    } else {
                      game.over(game.me.identity == 'zhu');
                    }
                  }
                },
                group: ['furrykill_quanneng_kill_self'],
                subSkill: {
                  self: {
                    trigger: {
                      player: "die",
                    },
                    direct: true,
                    charlotte: true,
                    priority: 10,
                    forceDie: true,
                    content: function () {
                      if (_status.mode == 'two') {
                        game.over(false);
                      } else {
                        game.over(game.me.identity == 'zhu');
                      }
                    },
                    sub: true,
                  }
                }
              },

              furrykill_xingzhou: {
                lock: true,
                enable: "phaseUse",
                filterCard: function (card, player) {
                  return card.name == 'tao';
                },
                filterTarget: function (card, player, target) {
                  return player != target && lib.filter.cardEnabled({ name: 'tao' }, target, target);
                },
                discard: false,
                lose: false,
                filter: function (event, player) {
                  return player.hasCard('tao');
                },
                prompt: "你可以对其他角色使用桃",
                content: function () {
                  player.useCard(cards, targets[0]).animate = false;
                },
                ai: {
                  order: 9.5,
                  result: {
                    target: function (player, target) {
                      return get.recoverEffect(target, player, target);
                    },
                  },
                  threaten: 3,
                },
                group: ['furrykill_xingzhou_use', 'furrykill_xingzhou_recover'],
                subSkill: {
                  use: {
                    trigger: { player: 'useCardToTargeted' },
                    direct: true,
                    filter: function (event, player) {
                      return player != event.target && event.card.name == 'tao';
                    },
                    content: function () {
                      player.draw();
                    },
                    sub: true,
                  },
                  recover: {
                    trigger: { global: "recoverEnd" },
                    direct: true,
                    filter: function (event, player) {
                      var evt = event.getParent("furrykill_xingzhou_after");
                      if (evt && evt.name == "furrykill_xingzhou_after") {
                        return false;
                      }
                      return player == event.source;
                    },
                    content: function () {
                      trigger.player.addSkill('furrykill_xingzhou_after');
                    },
                    sub: true,
                  },
                }
              },
              furrykill_xingzhou_after: {
                trigger: { player: 'phaseEnd' },
                charlotte: true,
                direct: true,
                priority: 201,
                content: function () {
                  if (!player.isHealthy()) {
                    player.logSkill('furrykill_xingzhou');
                    player.recover();
                  }
                  player.removeSkill('furrykill_xingzhou_after');
                },
              },

              furrykill_xingzhan: {
                enable: "phaseUse",
                usable: 1,
                unique: true,
                content: function () {
                  'step 0';
                  player.draw();
                  'step 1';
                  player.chooseTarget(true,
                    function (card, player, target) {
                      return true;
                    }
                  ).set('prompt', get.prompt('furrykill_xingzhan')).set('ai', function (target) {
                    return get.attitude(player, target);
                  });
                  'step 2';
                  if (result.bool) {
                    event.target = result.targets[0];
                    player.chooseCard('he', true, '选择一张牌作为“星”');
                  }
                  'step 3';
                  if (result.bool) {
                    var cs = result.cards;
                    event.target.addToExpansion(cs, player, 'give').gaintag.add('furrykill_xingzhan_star');
                    if (!event.target.hasSkill('furrykill_xingzhan_star'))
                      event.target.addSkill('furrykill_xingzhan_star');
                  }
                  'step 4';
                  var stars = 0;
                  var players = game.filterPlayer(p => p.hasSkill('furrykill_xingzhan_star'));
                  players.forEach(p => {
                    stars += p.getExpansions("furrykill_xingzhan_star").length;
                  });
                  if (stars > 3) {
                    player.chooseTarget(true, '选择一个目标移去一个“星”',
                      function (card, player, target) {
                        return players.contains(target);
                      }
                    ).set('ai', function (target) {
                      return -get.attitude(player, target);
                    });
                  } else {
                    event.finish();
                  }
                  'step 5';
                  if (result.bool) {
                    event.target = result.targets[0];
                    var starArray = event.target.getExpansions("furrykill_xingzhan_star");
                    if (starArray.length == 1) {
                      event.target.removeSkill('furrykill_xingzhan_star');
                      event.finish();
                    } else {
                      player.chooseButton(true, ['移去一个“星”', starArray])
                        .set('filterButton', function (button) {
                          return ui.selected.buttons.length == 0;
                        }).set('ai', function (button) {
                          return 10 - get.value(button.link);
                        }).set('cards', starArray);
                    }
                  }
                  'step 6';
                  if (result.bool && result.links) {
                    event.target.loseToDiscardpile(result.links);
                  }
                },
              },
              furrykill_xingzhan_star: {
                init2: function (player) {
                  player.storage.furrykill_xingzhan_star_black = 0;
                  player.storage.furrykill_xingzhan_star_red = 0;
                },
                charlotte: true,
                intro: {
                  content: "expansion",
                  markcount: "expansion",
                },
                marktext: "星",
                onremove: function (player, skill) {
                  delete player.storage.furrykill_xingzhan_star_black;
                  delete player.storage.furrykill_xingzhan_star_red;
                  var cards = player.getExpansions("furrykill_xingzhan_star");
                  if (cards.length) player.loseToDiscardpile(cards);
                },
                group: [
                  'furrykill_xingzhan_star_black',
                  'furrykill_xingzhan_star_red',
                  'furrykill_xingzhan_star_reset'
                ],
                subSkill: {
                  black: {
                    trigger: { source: "damageBegin2" },
                    direct: true,
                    priority: 4,
                    filter: function (event, player) {
                      var cards = player.getExpansions("furrykill_xingzhan_star");
                      if (!cards.some(c => get.color(c) == 'black')) return false;

                      var limit = 1;
                      var basic = false;
                      var trick = false;
                      var equip = false;
                      var players = game.filterPlayer(p => p.hasSkill('furrykill_xingzhan_star'));
                      players.forEach(p => {
                        p.getExpansions("furrykill_xingzhan_star").forEach(c => {
                          switch (get.type(c, 'trick')) {
                            case 'basic':
                              basic = true;
                              break;
                            case 'trick':
                              trick = true;
                              break;
                            case 'equip':
                              equip = true;
                              break;
                          }
                        });
                      });
                      if (basic && trick && equip) limit = 2;
                      if (player.storage.furrykill_xingzhan_star_black >= limit) return false;

                      return player == event.player || get.distance(player, event.player) <= 1;
                    },
                    content: function () {
                      player.draw();
                      player.storage.furrykill_xingzhan_star_black++;
                    },
                    sub: true,
                  },
                  red: {
                    trigger: { source: "damageBegin2" },
                    direct: true,
                    priority: 4,
                    filter: function (event, player) {
                      var cards = player.getExpansions("furrykill_xingzhan_star");
                      if (!cards.some(c => get.color(c) == 'red')) return false;

                      var limit = 1;
                      var basic = false;
                      var trick = false;
                      var equip = false;
                      var players = game.filterPlayer(p => p.hasSkill('furrykill_xingzhan_star'));
                      players.forEach(p => {
                        p.getExpansions("furrykill_xingzhan_star").forEach(c => {
                          switch (get.type(c, 'trick')) {
                            case 'basic':
                              basic = true;
                              break;
                            case 'trick':
                              trick = true;
                              break;
                            case 'equip':
                              equip = true;
                              break;
                          }
                        });
                      });
                      if (basic && trick && equip) limit = 2;
                      if (player.storage.furrykill_xingzhan_star_red >= limit) return false;

                      return get.distance(player, event.player) > 1;
                    },
                    content: function () {
                      player.draw();
                      player.storage.furrykill_xingzhan_star_red++;
                    },
                    sub: true,
                  },
                  reset: {
                    trigger: { global: "phaseEnd" },
                    direct: true,
                    priority: 4,
                    content: function () {
                      player.storage.furrykill_xingzhan_star_black = 0;
                      player.storage.furrykill_xingzhan_star_red = 0;
                    },
                    sub: true,
                  },
                },
              },

              furrykill_xinggong: {
                init: function (player) {
                  player.storage.furrykill_xinggong = false;
                },
                unique: true,
                enable: "phaseUse",
                skillAnimation: true,
                animationColor: "thunder",
                limited: true,
                filter: function (event, player) {
                  return !player.storage.furrykill_xinggong
                    && game.filterPlayer(p =>
                      p.hasSkill('furrykill_xingzhan_star')
                      && !p.isHealthy()
                    ).length > 0;
                },
                content: function () {
                  'step 0';
                  player.awakenSkill('furrykill_xinggong');
                  player.storage.furrykill_xinggong = true;
                  event.players = game.filterPlayer(p =>
                    p.hasSkill('furrykill_xingzhan_star')
                    && !p.isHealthy()
                  );
                  event.num = 0;
                  'step 1';
                  event.players[event.num].recover();
                  'step 2';
                  event.num++;
                  if (event.num < event.players.length) event.goto(1);
                },
                mark: true,
                intro: {
                  content: "limited",
                },
              },

              furrykill_zhengfa: {
                init: function (player) {
                  player.storage.furrykill_zhengfa = 0;
                },
                audio: 2,
                enable: "phaseUse",
                position: "he",
                filterCard: true,
                selectCard: function () {
                  var player = _status.event.player;
                  if (player.hp == player.storage.furrykill_zhengfa) return 0;
                  return player.storage.furrykill_zhengfa;
                },
                check: function (card) {
                  return 5 - get.value(card)
                },
                delay: false,
                content: function () {
                  player.draw();
                  player.storage.furrykill_zhengfa += 1;
                },
                group: "furrykill_zhengfa_clear",
                subSkill: {
                  clear: {
                    trigger: {
                      player: "phaseBefore",
                    },
                    forced: true,
                    silent: true,
                    popup: false,
                    content: function () {
                      player.storage.furrykill_zhengfa = 0;
                    },
                    sub: true,
                  },
                },
                ai: {
                  order: 10,
                  result: {
                    player: 1,
                  },
                },
              },

              furrykill_shouxiang: {
                audio: 2,
                trigger: {
                  target: "useCardToTargeted",
                },
                filter: function (event, player) {
                  if (event.card.name != 'sha' && event.card.name != 'juedou') return false;
                  return player.countCards('e') > 0;
                },
                content: function () {
                  var cards = player.getCards('e');
                  trigger.player.gain(cards, player, 'giveAuto');
                  trigger.excluded.push(player);
                },
              },

              furrykill_shunshan: {
                group: ["furrykill_shunshan_wuxie"],
                enable: "chooseToUse",
                filter: function (event, player) {
                  if (!player.countCards('hes', c => get.type(c) == 'equip')) return false;
                  var list = ['sha', 'shan', 'tao', 'jiu'];
                  for (var i = 0; i < list.length; i++) {
                    if (event.filterCard({ name: list[i] }, player)) return true;
                  }
                  return false;
                },
                chooseButton: {
                  dialog: function () {
                    var list = [];
                    for (var i = 0; i < lib.inpile.length; i++) {
                      var name = lib.inpile[i];
                      if (name == 'wuxie') continue;
                      if (name == 'sha') {
                        list.push(['基本', '', 'sha']);
                        for (var j of lib.inpile_nature) list.push(['基本', '', 'sha', j]);
                      }
                      else if (get.type(name) == 'basic') list.push(['基本', '', name]);
                    }
                    return ui.create.dialog('瞬闪', [list, 'vcard'], 'hidden');
                  },
                  filter: function (button, player) {
                    var evt = _status.event.getParent();
                    if (evt && evt.filterCard) {
                      return evt.filterCard({ name: button.link[2] }, player, evt);
                    }
                    return true;
                  },
                  backup: function (links, player) {
                    return {
                      filterCard: function (card) {
                        return get.type(card) == 'equip';
                      },
                      selectCard: 1,
                      position: 'hes',
                      check: (card) => 8 - get.value(card),
                      viewAs: { name: links[0][2], nature: links[0][3] },
                    }
                  },
                  prompt: function (links, player) {
                    return '将一张装备牌做当' + get.translation(links[0][2]) + '使用';
                  },
                },
                ai: {
                  save: true,
                  respondShan: true,
                  fireAttack: true,
                  threaten: 1.2,
                },
              },
              furrykill_shunshan_wuxie: {
                log: false,
                silent: true,
                popup: false,
                enable: "chooseToUse",
                selectCard: 1,
                position: 'hes',
                filterCard: function (card) {
                  return get.type(card) == 'equip';
                },
                viewAsFilter: function (player) {
                  return player.countCards('hes', c => get.type(c) == 'equip') > 0
                },
                viewAs: {
                  name: "wuxie",
                },
                check: function (card) {
                  return 10;
                },
                prompt: "将一张装备牌当无懈可击使用",
                threaten: 1.2,
              },

              furrykill_yixing: {
                enable: "phaseUse",
                usable: 1,
                filterTarget: function (card, player, target) {
                  return target != player && target.countCards('he') > 0;
                },
                content: function () {
                  'step 0';
                  event.originCount = player.countCards('h');
                  player.choosePlayerCard(target, true, 'he');
                  'step 1';
                  if (result.bool) {
                    event.cardx = result.cards[0];
                    target.showCards(event.cardx);
                  }
                  else {
                    event.finish();
                  }
                  'step 2';
                  if (!target.canUse(event.cardx, player, null, true)) {
                    player.gain(target, event.cardx);
                  }
                  else {
                    target.useCard(event.cardx, player, false);
                  }
                  'step 3';
                  if (player.countCards('h') == event.originCount) {
                    player.getStat('skill').furrykill_yixing--;
                  }
                },
                ai: {
                  order: 5,
                  result: {
                    target: -1,
                  },
                },
              },

            },
            dynamicTranslate: dynamicTranslate,
            translate: {
              furrykill_yinchang: "吟唱",
              furrykill_dingchen: "定尘",
              furrykill_dingchen_info: "隐匿，你于回合外登场后，可以视为对当前回合角色使用一张杀。",
              furrykill_suixin: "碎心",
              furrykill_suixin_info: "锁定技，你对未受伤角色造成伤害时，该角色失去一点体力；你成为杀或决斗的目标时，若你的武将牌背面朝上，可以弃置一张牌，取消目标。",
              furrykill_xiaoshi: "消逝",
              furrykill_xiaoshi_info: "每轮限一次，其他角色的准备阶段，你可以视为对该角色使用一张杀。若此杀造成伤害，你弃置该角色的一张牌；否则你翻面。",
              furrykill_fenyou: "分忧",
              furrykill_fenyou_info: "你攻击范围内的其他角色成为基本牌或普通锦囊的唯一目标时，若使用者不是你，你可以失去一点体力，取消之。",
              furrykill_zhian: "致安",
              furrykill_zhian_info: "其他角色的准备阶段，你可以交给其一张黑色牌，其选择一项：1、摸一张牌；2、弃置一张红色牌，令你回复一点体力。",
              furrykill_shanjian: "闪剑",
              furrykill_shanjian_info: "出牌阶段限一次，你可以摸一张牌并指定一名角色，直到此阶段结束，你与其结算距离为1，且使用的牌只能以你或该角色为目标。",
              furrykill_yvnian: "驭念",
              furrykill_yvnian_info: "你即将造成属性伤害时，可以弃一张牌令伤害+1，或摸一张牌令伤害-1。",
              furrykill_qianlie: "潜猎",
              furrykill_qianlie_info: "转换技，阳：以你为目标的锦囊牌结算完毕后，可以使用一张杀或伤害锦囊牌。阴：你造成的伤害结算完毕后，可以发现一张牌，若此时是你的出牌阶段，你跳过本回合的弃牌阶段，并且本阶段你不能再使用牌。",
              furrykill_youxia: "游侠",
              furrykill_youxia_info: "锁定技，摸牌阶段，你额外摸一张牌。",
              furrykill_xulei: "蓄雷",
              furrykill_xulei_info: "锁定技，你的武将牌始终背面朝上，且你没有判定区。你成为非装备牌的目标时，或一名角色受到伤害后，若你的手牌数少于6，摸一张牌。",
              furrykill_shineng: "势能",
              furrykill_shineng_info: "一名角色的回合结束时，你可以弃置任意数量的牌。若这些牌的点数之和不小于13，你可以使用其中的一张；若点数之和不小于32，你可以造成一点雷电伤害。",
              furrykill_lingfeng: "灵风",
              furrykill_lingfeng_info: "其他角色弃置的牌进入弃牌堆后，你可以弃置一张牌并获得其中一张。",
              furrykill_zhuiying: "追影",
              furrykill_zhuiying_info: "每个回合限一次，你的牌因弃置进入弃牌堆后，你可以使用其中的一张。",
              furrykill_shuang: "霜",
              furrykill_lvbing: "履冰",
              furrykill_lvbing_info: "隐匿，你于其他角色的回合登场后，可以将一张牌置于武将牌上，称为霜。",
              furrykill_hanren: "寒刃",
              furrykill_hanren2: "寒刃",
              furrykill_hanren_info: "结束阶段，你可以将一张牌置于武将牌上，称为霜。其他角色的出牌阶段开始时，你可以交给其一张霜，然后该角色不能使用、打出或弃置与霜类别相同的牌，直到此回合结束。",
              furrykill_ruiyan: "锐眼",
              furrykill_ruiyan_info: "出牌阶段限一次，你可以观看一名其他角色的手牌，若其中包含至少两种类别的牌，你选择其中一张获得；否则其获得你的一张牌。",
              furrykill_fuyun: "福运",
              furrykill_fuyun_info: "锁定技，你的回合内，你的♠牌均视为♥花色。",
              furrykill_changlong: "昌隆",
              furrykill_changlong_info: "你使用的♥牌可以额外指定一名角色成为目标。",
              furrykill_qifu: "祈福",
              furrykill_qifu_info: "觉醒技，准备阶段，若你本局游戏使用的♥牌数量不少于7，你减少一点体力上限，失去昌隆，然后获得招财。",
              furrykill_zhaocai: "招财",
              furrykill_zhaocai_info: "出牌阶段，你可以弃置一张♥牌，令一名其他角色摸两张牌。",
              furrykill_lianfu: "链缚",
              furrykill_lianfu_info: "锁定技，游戏开始时，你横置；你的武将牌重置时，改为你增加一点体力上限，然后选择一项:1、摸两张牌;2、获得场上的一张牌;3、于当前回合结束后横置至多两名其他角色。",
              furrykill_pojia: "破枷",
              furrykill_pojia_info: "觉醒技，你濒死时，恢复全部体力，失去链缚。当前回合结束后，你将手牌补至体力上限，然后横置所有角色。",
              furrykill_dielang: "叠浪",
              furrykill_dielang_info: "锁定技，你于出牌阶段非第一次使用牌时，若此牌点数大于你于此阶段使用的上一张牌，你摸一张牌；否则你弃置三张类别不同的牌或于此牌结算完毕后结束出牌阶段。",
              furrykill_shouhe: "收合",
              furrykill_shouhe_info: "出牌阶段限一次，你可以将手牌中点数最小的牌当做无次数限制的雷杀使用。若此牌点数与你本阶段使用的上一张牌相差至少8点，本回合你的手牌上限+2。",
              furrykill_yaodang: "摇荡",
              furrykill_yaodang_info: "锁定技，弃牌阶段你弃置牌后，摸一张牌。吟唱，你受到一点伤害。",
              furrykill_baolei: "暴雷",
              furrykill_baolei_info: "吟唱，结束阶段，你可以对两名角色分别造成一点雷电伤害。",
              furrykill_jiyong: "即咏",
              furrykill_jiyong_info: "限定技，出牌阶段，若你未吟唱，可以将吟唱状态变更为已吟唱。",
              furrykill_yanmu: "烟幕",
              furrykill_yanmu_info: "隐匿，你于回合外登场时，本回合你不能成为杀或决斗的目标。",
              furrykill_zhuiren: "追刃",
              furrykill_zhuiren_info: "你于出牌阶段使用的第一张普通锦囊牌结算完毕后，可以将一张手牌当作杀使用（此杀无距离和次数限制）。若此杀造成伤害，你摸一张牌。",
              furrykill_xuenu: "血怒",
              furrykill_xuenu_info: "限定技，出牌阶段开始时,若你已受伤，你可以摸等同于装备区里装备数量的牌并废除装备区，然后在本回合中，去掉追刃描述中的“第一张”。",
              furrykill_xunmei: "寻梅",
              furrykill_xunmei_info: "隐匿，你登场后，可以展示牌堆顶的四张牌，获得其中的♣牌，将其余的牌置入弃牌堆。",
              furrykill_luoxue: "落雪",
              furrykill_luoxue_info: "出牌阶段限一次，你可以弃置一张♣牌，对一名角色造成一点伤害。然后本回合结束后，若该角色死亡，你进行一个额外的回合。",
              furrykill_tanying: "探樱",
              furrykill_tanying_info: "其他角色的出牌阶段结束时，若此阶段使用的最后一张牌是♣牌且存在于场上或弃牌堆，你可以获得之。",
              furrykill_mingxue: "明雪",
              furrykill_mingxue_info: "隐匿，你于其他角色的回合登场后，明置一张牌，若此牌是基本牌或普通锦囊牌，你可以视为使用一张同名的牌。",
              furrykill_shuangci: "霜刺",
              furrykill_shuangci_info: "你使用杀指定目标后，可令目标弃置X种类别的牌各一张（X为你明置牌的数量），否则此杀不可被响应。你的攻击距离+X。",
              furrykill_hanlv: "寒履",
              furrykill_hanlv_info: "出牌阶段限一次，你可以明置至多两张牌。结束阶段，若你所有手牌均明置，你可以摸一张牌。",
              furrykill_xunzhou: "寻昼",
              furrykill_xunzhou_info: "锁定技，每当有牌非因使用、弃置或零时进入弃牌堆后，你将这些牌扣置于武将牌旁，称为【挚】。",
              furrykill_tansu: "探溯",
              furrykill_tansu_info: "出牌阶段限一次，你可以从牌堆或【挚】中发现一张牌。",
              furrykill_lingshi: "零时",
              furrykill_lingshi_info: "锁定技，一名角色的回合结束后，若【挚】中的牌数量为10的倍数，你将所有【挚】置入弃牌堆，并进行一个额外的回合。",
              furrykill_wuzhu: "乌珠",
              furrykill_wuzhu_global: "乌珠",
              furrykill_wuzhu_info: "每名角色的出牌阶段限一次，其可以失去一点体力，令你摸两张牌，然后你交给其一至两张牌。",
              furrykill_qunchong: "群宠",
              furrykill_qunchong_info: "出牌阶段限一次，若你的手牌上限不为0，你可以选择任意名已受伤角色并弃置等量张牌，令这些角色恢复一点体力（若选择的角色数与你的手牌上限不等，你的手牌上限-1）。",
              furrykill_yongdai: "拥戴",
              furrykill_yongdai_info: "出牌阶段开始时，你可以展示手牌，然后指定至多三名其他角色，这些角色选择是否交给你一张牌。然后出牌阶段结束时，若你于此阶段造成了伤害，选择交给你牌的角色摸一张牌，选择不交给你牌的角色弃一张牌；若你没有造成伤害，选择交给你牌的角色弃一张牌，选择不交给你牌的角色摸一张牌。",
              furrykill_jiyin: "激音",
              furrykill_jiyin_info: "每回合限一次，你造成伤害后，可以选择一项：1、令至多两名角色分别弃置一张牌；2、令该角色攻击范围内的一名角色失去一点体力。",
              furrykill_qingquan: "清泉",
              furrykill_qingquan_info: "每回合限一次，你受到伤害后，可以选择一项：1、令至多两名角色分别摸一张牌；2、令攻击范围内的一名其他角色恢复一点体力。",
              furrykill_xiaoxue: "效学",
              furrykill_xiaoxue_info: "其他角色的回合限一次，一名色使用的基本牌或普通锦囊结算完毕后，若你没有同类别的明置牌，你可以弃置一张与之类别相同、牌名不同的暗置牌，获得此牌并明置。",
              furrykill_chengming: "澄明",
              furrykill_chengming_info: "转换技，锁定技，阳：你的暗置牌因弃置进入弃牌堆后，你摸一张牌。阴：你使用明置的牌后，摸一张牌。",
              furrykill_canghai: "沧海",
              furrykill_canghai_info: "出牌阶段开始时，你可以摸两张牌。若如此做，你于此阶段第一次使用每种类别的牌时，你需弃置一张牌。",
              furrykill_juanren: "卷刃",
              furrykill_juanren_info: "若你于一回合内因弃置失去了至少三张牌，回合结束时你可以造成一点伤害。",
              furrykill_yanfan: "焰反",
              furrykill_yanfan_info: "你受到伤害后，可以指定一名角色，若其角色手牌与体力值相等，则受到一点火焰伤害；否则其将手牌调整至体力值。（摸牌时至多摸至5张）",
              furrykill_xueyue: "血月",
              furrykill_xueyue_info: "限定技，出牌阶段，你可以对自己造成一点伤害，然后指定一名角色，该角色所有技能失效至到其回合结束。",
              furrykill_sanwei: "三尾",
              furrykill_sanwei_info: "游戏开始时，你获得3个【镜】。准备阶段，你选择X项，本回合中这些这些数值+1（X为【镜】的数量）：1、摸牌阶段的摸牌数；2、出牌阶段使用杀的次数；3、手牌上限。然后，没有被选择的数值在本回合中-1。",
              furrykill_ganlin: "甘霖",
              furrykill_ganlin_info: "一名角色进入濒死时，你可以移除一个【镜】令其回复体力至2。然后若你没有【镜】，你死亡。",
              furrykill_jixing: "疾行",
              furrykill_jixing_info: "锁定技，出牌阶段，你至多可以使用三张牌。你可以将锦囊牌当做加速使用（普通锦囊，出牌阶段使用，摸一张牌，此阶段你可以额外使用两张牌）。",
              furrykill_xiemu: "谢幕",
              furrykill_xiemu_info: "结束阶段，你本回合每使用过四张牌，便可以造成一次一点伤害。",
              furrykill_yvmo: "御魔",
              furrykill_yvmo_info: "锁定技，使用锦囊牌后，获得火；使用装备牌后，获得水；你使用基本牌后，获得木（每种标记最多拥有1个）。若你同时拥有三种标记且未吟唱，你将它们移除并进行吟唱。",
              furrykill_sanyuan: "三元",
              furrykill_sanyuan_info: "吟唱，转换技，其他角色的准备阶段，你可以① ：视为对其使用一张铁索连环并对其造成一点火焰伤害；② ：获得其装备区里的一张牌并使用之；③ ：视为对其使用一张杀，若此杀造成伤害，你恢复一点体力。",
              furrykill_yuanli: "源力",
              furrykill_yuanli_info: "你的手牌上限+2。结束阶段，你可以转换一次三元。",
              furrykill_qianmeng: "牵梦",
              furrykill_qianmeng_info: "出牌阶段限一次，你可以选择至多两名其他角色，展示并分别交给这些角色一张牌。然后这些角色可以使用你给出的牌。",
              furrykill_zheyue: "遮月",
              furrykill_zheyue_info: "一名角色在其回合外使用杀或锦囊牌时，你可以令你或该角色摸一张牌。",
              furrykill_suqing: "肃清",
              furrykill_suqing_info: "锁定技，出牌阶段开始时，你选择一名体力值不大于你的角色，然后弃置其每个区域内的一张牌。此回合结束时，若你未对其造成伤害，你失去一点体力。",
              furrykill_shenfu: "神赋",
              furrykill_shenfu_info: "觉醒技，你濒死时，减少一点体力上限，恢复2点体力，获得执光，并修改肃清。若你没有因肃清弃置其他角色的牌，摸4张牌，且本局游戏中，你于出牌阶段使用杀的次数+1。",
              furrykill_zhiguang: "执光",
              furrykill_zhiguang_info: "你对肃清的角色使用牌没有距离限制，且对其造成伤害后，可以摸一张牌。",
              furrykill_mozhen: "魔阵",
              furrykill_enze: "恩泽",
              furrykill_enze_info: "回合开始时，你可以选择一项：</br>开眼，将牌堆顶的一张牌置入【魔阵】中，本回合你获得【真瞳】；</br>沟通，交换手牌和【魔阵】中的一张牌，本回合你获得【八爪】；</br>献祭，将一张手牌置入【魔阵】中，本回合你获得【秽咒】；</br>退缩，获得【魔阵】中的一张牌。",
              furrykill_jianglin: "降临",
              furrykill_jianglin_info: "觉醒技，回合结束时，若你于本局游戏中至少击杀过一名角色，累计造成的伤害不少于4，且此时【魔阵】中的牌数量为4且花色各不相同，你化身为真正的恶魔，与其他所有人为敌。",
              furrykill_quanneng: "权能",
              furrykill_quanneng1: "真瞳",
              furrykill_quanneng1_info: "准备阶段，你可以发现一张牌。",
              furrykill_quanneng2: "八爪",
              furrykill_quanneng2_info: "出牌阶段，你使用的黑色牌可以额外指定一个目标。",
              furrykill_quanneng3: "秽咒",
              furrykill_quanneng3_info: "结束阶段，你可以造成一点伤害。",
              furrykill_quanneng_info: "1、准备阶段，你可以发现一张牌。</br>2、出牌阶段，你使用的黑色牌可以额外指定一个目标。</br>3、结束阶段，你可以造成一点伤害。",
              furrykill_xingzhou: "星昼",
              furrykill_xingzhou_info: "锁定技，因你回复体力的角色（此效果除外）在其下个回合的结束阶段回复一点体力；</br>出牌阶段，你可以对其他角色使用桃；</br>你对其他角色使用桃时，摸一张牌。",
              furrykill_xingzhan: "星占",
              furrykill_xingzhan_star: "星",
              furrykill_xingzhan_info: "出牌阶段限一次，你可以摸一张牌，然后将一张牌置于一名角色的武将牌上，称为星，然后若星的数量大于3，移去一个星。</br>有黑色星的角色对距离为1以内的角色造成伤害时，摸一张牌；</br>有红色星的角色对距离大于1的角色造成伤害时，摸一张牌。</br>（每种效果每回合限一次，若场上有三种类别的星，将限一次改为限两次。）",
              furrykill_xinggong: "星宫",
              furrykill_xinggong_info: "限定技，出牌阶段，你可以令所有有星的角色恢复一点体力。",
              furrykill_zhengfa: "征伐",
              furrykill_zhengfa_info: "出牌阶段，你可以弃置X张牌，然后摸一张牌，若你的体力值等于X，你无需弃牌（X为你此前于此阶段发动此技能的次数）。",
              furrykill_shouxiang: "授降",
              furrykill_shouxiang_info: "你成为杀或决斗的目标时，你可将装备区里的所有牌交给此牌的使用者，若如此做，此牌对你无效。",
              furrykill_shunshan: "瞬闪",
              furrykill_shunshan_wuxie: "瞬闪",
              furrykill_shunshan_info: "你可以将装备牌当做一张基本牌或无懈可击使用。",
              furrykill_yixing: "异星",
              furrykill_yixing_info: "出牌阶段限一次，你可以选择一名其他角色的一张牌并展示。若你是该角色使用此牌的合法目标，则该角色对你使用此牌；否则你获得此牌。然后若你的手牌数没有发生变化，你视为未发动本技能。",
            },
          },
        }, "FurryKill");

        //#region Fake
        //if (lib.config.extension_FurryKill_fake) {
        lib.characterReplace["furrykill_anliang"] = ["furrykill_anliang", "furrykill_anliang_jie"];

        lib.dynamicTranslate["furrykill_ruiyan_jie"] = function (player) {
          if (player.storage.furrykill_ruiyan_jie2) return '出牌阶段限一次，你可以观看一名其他角色的手牌，若其中包含至少两种类别的牌，你可以选择其中一张获得或弃置你与其一种类别的手牌（你必须拥有此类别的牌）；否则其获得你区域内的牌。';
          return '出牌阶段限一次，你可以观看一名其他角色的手牌，若其中包含至少两种类别的牌，你可以选择其中一张获得或弃置你与其一种类别的手牌（你必须拥有此类别的牌），然后修改〖锐眼〗直到本轮结束；否则其获得你的一张牌。';
        },

          game.导入character("FurryKillFake", "FurryKillFake", {
            connect: true,
            character: {
              character: {
                furrykill_anliang_jie: [
                  "male",
                  "furrykill_wolf",
                  3,
                  ["furrykill_lvbing_jie", "furrykill_hanren_jie", "furrykill_ruiyan_jie"],
                  ["hiddenSkill", "des:珀瞳"],
                ],
              },
              translate: {
                furrykill_anliang_jie: "界安谅",
              },
            },
            characterTitle: {
            },
            skill: {
              skill: {
                furrykill_lvbing_jie: {
                  trigger: {
                    player: "showCharacterAfter",
                  },
                  hiddenSkill: true,
                  popup: false,
                  filter: function (event, player) {
                    var target = _status.currentPhase;
                    return event.toShow.contains('furrykill_anliang_jie') && target && target == player;
                  },
                  content: function () {
                    'step 0';
                    if (player.countCards('he')) {
                      player.chooseCard('he', [1, player.maxHp], '履冰：将至多' + get.cnNumber(player.maxHp) + '张牌置于武将牌上作为【霜】').set('ai', function (card) {
                        return 5 - get.value(card);
                      });
                    } else {
                      event.finish();
                    }
                    'step 1';
                    if (result.bool) {
                      player.addToExpansion(result.cards, player, 'giveAuto').gaintag.add('furrykill_hanren_jie');
                      player.logSkill('furrykill_lvbing_jie');
                    }
                  },
                },

                furrykill_hanren_jie: {
                  group: ["furrykill_hanren_jie_1"],
                  trigger: { player: 'phaseJieshuBegin' },
                  popup: false,
                  notemp: true,
                  filter: function (event, player) {
                    return player.countCards('he');
                  },
                  content: function () {
                    'step 0';
                    player.chooseCard('he', '寒刃：是否将一张牌置于武将牌上作为【霜】？');
                    'step 1';
                    if (result.bool) {
                      player.addToExpansion(result.cards, player, 'giveAuto').gaintag.add('furrykill_hanren_jie');
                      player.logSkill('furrykill_hanren_jie');
                    }
                  },
                  intro: {
                    content: 'expansion',
                    markcount: 'expansion',
                  },
                  marktext: '霜',
                  onremove: function (player, skill) {
                    var cards = player.getExpansions("furrykill_hanren_jie");
                    if (cards.length) player.loseToDiscardpile(cards);
                  },
                  subSkill: {
                    1: {
                      trigger: { global: "phaseUseBegin" },
                      popup: false,
                      frequent: true,
                      filter: function (event, player) {
                        return event.player != player
                          && event.player.isAlive()
                          && player.getExpansions('furrykill_hanren_jie').length > 0;
                      },
                      content: function () {
                        'step 0';
                        event.target2 = _status.currentPhase;
                        event.shuang = player.getExpansions('furrykill_hanren_jie');
                        player.chooseButton(['寒刃：是否交给其一张【霜】？其不能使用、打出或弃置与霜类别相同的牌，直到此回合结束。', event.shuang]).set('filterButton', function (button) {
                          return ui.selected.buttons.length == 0;
                        }).set('ai', function (button) {
                          if (get.attitude(player, event.target2) > 0) return -1;
                          return 10 - get.value(button.link);
                        }).set('cards', event.shuang);
                        'step 1';
                        if (result.bool && result.links) {
                          event.usedShuang = result.links[0];
                          event.target2.gain(event.usedShuang, player, 'giveAuto');
                        } else {
                          event.finish();
                        }
                        'step 2';
                        event.target2.storage.furrykill_hanren2_jie = get.type(event.usedShuang, 'trick');
                        'step 3';
                        event.target2.addTempSkill("furrykill_hanren2_jie");
                        player.addTempSkill("furrykill_hanren3_jie");
                        game.log(player, '对', event.target2, '发动了【寒刃】，【霜】为', event.usedShuang);
                      },
                      sub: true,
                    }
                  }
                },
                furrykill_hanren2_jie: {
                  mark: true,
                  charlotte: true,
                  forced: true,
                  intro: {
                    content: "不能使用、打出或弃置与霜类别相同的牌"
                  },
                  mod: {
                    cardDiscardable: function (card, player) {
                      if (get.type(card, 'trick') == player.storage.furrykill_hanren2_jie) return false;
                    },
                    cardEnabled: function (card, player) {
                      if (get.type(card, 'trick') == player.storage.furrykill_hanren2_jie) return false;
                    },
                    cardEnabled2: function (card, player) {
                      if (get.type(card, 'trick') == player.storage.furrykill_hanren2_jie) return false;
                    },
                  },
                  onremove: function (player) {
                    delete player.storage.furrykill_hanren2_jie;
                  },
                },
                furrykill_hanren3_jie: {
                  trigger: { global: 'phaseUseEnd' },
                  prompt2: function (event, player) {
                    return '对' + get.translation(event.player) + '发动〖锐眼〗？';
                  },
                  content: function () {
                    player.logSkill('furrykill_hanren_jie', trigger.player);
                    var next = game.createEvent('furrykill_hanren_ruiyan');
                    next.player = player;
                    next.target = trigger.player;
                    next.setContent(lib.skill.furrykill_ruiyan_jie.content);
                  }
                },

                furrykill_ruiyan_jie: {
                  init: function (player) {
                    player.storage.furrykill_ruiyan_jie2 = false;
                  },
                  enable: 'phaseUse',
                  usable: 1,
                  filterTarget: function (card, player, target) {
                    return target != player && target.countCards('h') > 0;
                  },
                  content: function () {
                    'step 0';
                    player.viewHandcards(target);
                    'step 1';
                    var cards = target.getCards('h');
                    var types = cards.map((c) => {
                      return get.type(c, 'trick');
                    });
                    var typeCount = types.filter((item, index) => {
                      return types.indexOf(item) === index;
                    }).length;

                    if (typeCount >= 2) {
                      var list = ["选择其中一张获得", "弃置你与其手中一种类别的牌"];
                      var countCards = player.countCards('he');
                      if (countCards == 0) list.remove("弃置你与其手中一种类别的牌");
                      player.chooseControl(list, true, function () {
                        return "选择其中一张获得";
                      }).set('prompt', get.prompt2('furrykill_ruiyan_jie'));
                    } else {
                      if (!player.storage.furrykill_ruiyan_jie2) {
                        target.gainPlayerCard(1, 'he', player, true)
                      } else {
                        var cards = player.getCards('hej');
                        target.gain(cards, player, 'giveAuto');
                      }
                      event.finish();
                    }
                    'step 2';
                    if (result.control == "选择其中一张获得") {
                      player.storage.furrykill_ruiyan_jie2 = true;
                      player.gainPlayerCard(1, 'h', target, true, 'visible');
                      event.finish();
                    } else {
                      var list = ["基本牌", "锦囊牌", "装备牌"];
                      if (!player.hasCard(function (c) {
                        return get.type(c) == 'equip';
                      }, 'he')
                      ) {
                        list.remove("装备牌");
                      }
                      if (!player.hasCard(function (c) {
                        return get.type(c, 'trick') == 'trick';
                      }, 'h')
                      ) {
                        list.remove("锦囊牌");
                      }
                      if (!player.hasCard(function (c) {
                        return get.type(c) == 'basic';
                      }, 'h')
                      ) {
                        list.remove("基本牌");
                      }
                      player.chooseControl(list, true, function () {
                        return list[0];
                      }).set('prompt', get.prompt2('furrykill_ruiyan_jie'));
                    }
                    'step 3';
                    event.discardType = "basic";
                    if (result.control == "锦囊牌") {
                      event.discardType = "trick";
                    } else if (result.control == "装备牌") {
                      event.discardType = "equip";
                    }
                    player.discard(player.getCards('h').filter(c =>
                      get.type(c, 'trick') == event.discardType));
                    'step 4';
                    player.storage.furrykill_ruiyan_jie2 = true;
                    target.discard(target.getCards('h').filter(c =>
                      get.type(c, 'trick') == event.discardType));
                  },
                  ai: {
                    order: 10,
                    result: {
                      player: function (player, target) {
                        if (get.attitude(player, target) > 0) return -1;
                        if (target.countCards('h') >= 4) return -get.attitude(player, target);
                        return -1;
                      },
                    },
                  },
                  group: ['furrykill_ruiyan_jie_round'],
                  subSkill: {
                    round: {
                      trigger: { global: 'roundStart' },
                      direct: true,
                      charlotte: true,
                      content: function () {
                        player.storage.furrykill_ruiyan_jie2 = false;
                      },
                    }
                  },
                },

              },
              translate: {
                furrykill_lvbing_jie: "履冰",
                furrykill_lvbing_jie_info: "隐匿，你于自己的回合登场后，可以将至多X张牌置于武将牌上，称为霜。(X为你的体力上限)",
                furrykill_hanren_jie: "寒刃",
                furrykill_hanren2_jie: "寒刃",
                furrykill_hanren3_jie: "寒刃",
                furrykill_hanren_jie_info: "结束阶段，你可以将一张牌置于武将牌上，称为霜。其他角色的出牌阶段开始时，你可以交给其一张霜，然后该角色不能使用、打出或弃置与霜类别相同的牌，直到此回合结束。其出牌阶段结束时，你可以对其执行〖锐眼〗的效果。",
                furrykill_ruiyan_jie: "锐眼",
                furrykill_ruiyan_jie_info: "出牌阶段限一次，你可以观看一名其他角色的手牌，若其中包含至少两种类别的牌，你可以选择其中一张获得或弃置你与其一种类别的手牌（你必须拥有此类别的牌），然后修改〖锐眼〗直到本轮结束；否则其获得你的一张牌。",
              },
            },
          }, "FurryKill");
        //}
        //#endregion
      }
    }, help: {}, config: {
      "FurryKill": { "name": "将FurryKill设为禁用", "init": false },
      //"fake": { "name": "启用假卡", "init": true },
    }, package: {
      intro: `
        <img src='extension/FurryKill/furrykill.jpg' width='100%' /></br>
				<span style='font-weight: bold;'>小动物的三国杀</span>
			`,
      author: "SwordFox & XuankaiCat",
      diskURL: "",
      forumURL: "",
      version: "1.9.115.2.22",
    },
  }
})