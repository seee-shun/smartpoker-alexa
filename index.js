/*
 * Alexa Skill of sample program
 * Copyright (c) 2018 Cybozu
 *
 * Licensed uner the MIT License
 */

var kintone = require('kintone-nodejs-sdk');
var Alexa = require('alexa-sdk');
var moment = require('moment');

var APP_ID = 4; // schedule app id
var ALEXA_APP_ID = 'amzn1.ask.skill.21c8a79e-3be9-4e99-a4ac-4ca9ec36b1df'; // your alexa skill id
var DOMAIN = 'devepinrz.cybozu.com'; // your domain
var API_TOKEN = 'gSmmiwpeb58XJbKnB4vqxCnxv4OSWgeoiy0ceI0M'; // API TOKEN
var kintoneAuth = new kintone.Auth();
kintoneAuth.setApiToken(API_TOKEN);
var kintoneConnection = new kintone.Connection(DOMAIN, kintoneAuth);
var kintoneRecord = new kintone.Record(kintoneConnection);

var COULD_NOT_CATCH = '聞き取れませんでした';
var groupid;
var recordData;
var handlers = {
    'LaunchRequest': function() {
        // スキル呼び出し時に呼び出されるintentgSmmiwpeb58XJbKnB4vqxCnxv4OSWgeoiy0ceI0M
        'use strict';
        this.emit(':ask', 'これからスマートポーカーを始めます。');
    },

    'gameSetIntent': function(){
        'use strict';
        var intentObj = this.event.request.intent;
        groupid = intentObj.slots.groupId.value;
        console.log(groupid);
        var add_complete_comment = 'ここからはアレクサでゲーム進行を行います。';
        var self = this;
        self.emit(':askWithCard', add_complete_comment, 'アクションをお答えください。あるいはじっくり考えてからスキルを開き直してください', add_complete_comment);
      
    },
  
    'AMAZON.YesIntent': function() {
        // ビルトインインテント
        'use strict';
        this.emit(':askWithCard', 'はい', 'OK', );
    },
    //スキル終了
    'AMAZON.NoIntent': function() {
        // ビルトインインテント
        'use strict';
        this.emit(':tellWithCard', 'わかりました。スマートポーカーを終了します。', '終了', '終了します。');
    },
    'AMAZON.StopIntent': function() {
    
    },
    'SessionEndedRequest': function () { 
        // 特に何も実装しない
       },
    //値の更新
    'updatePointIntent':function(){
        'use strict';
        //intentの引数を受け取る
        var intentObj = this.event.request.intent;
        var action = intentObj.slots.action.value;
        var totalpoint = intentObj.slots.totalPoint.value;
        var winner = intentObj.slots.winner.value;
  
        var time = moment().format('hh:mm:ss');
        console.log(winner);
        
        var updateKey =  { // Optional. Required, if id will not be specified.
            'field': 'groupId',
            'value': groupid
        };
        recordData = {
            'action':{
                'value': action
            },
            'point':{
                'value' :totalpoint
            },
            'time':{
                'value' :time
            },
            'winner':{
                'value' :winner
            },

        }     
        var add_complete = 'はい';

        if(action || totalpoint || winner){
            var self = this;
            //PUTリクエスト送信
            kintoneRecord.updateRecordByUpdateKey(APP_ID,updateKey,recordData).then(function(resp){
                self.emit(':askWithCard', action,'アクションをお答えください。あるいはじっくり考えてからスキルを開き直してください',  add_complete);
            }).catch(function(err){
                self.emit(':askWithCard', COULD_NOT_CATCH);
            });
        }else{
            this.emit(':askWithCard', COULD_NOT_CATCH,
                             'スロットエラー', COULD_NOT_CATCH);
        }
    },
};

exports.handler = function(event, context) {
    'use strict';
    var alexa = Alexa.handler(event, context);
    alexa.appId = ALEXA_APP_ID;
    alexa.registerHandlers(handlers);
    alexa.execute();
};