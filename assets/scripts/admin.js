require.config({
    paths: {
        'Zepto': 'libraries/zepto',
        'jquery': 'libraries/jquery',
        'underscore': 'libraries/underscore',
        'handlebars': 'libraries/handlebars',
        'jquery-storage': 'libraries/jquery-storage',
    },
    shim: {
        'Zepto': {
            exports: '$'
        },
        'underscore': {
            exports: '_'
        },
        'handlebars': {
            exports: 'Handlebars'
        },
        'jquery-storage': {
          deps : ['jquery']
        }
    }
});
require(['jquery', 'jquery-storage', 'underscore', 'handlebars', 'brands', 'questions'], function ($, storage, _, Handlebars, brands, questions) {
 
  var likert = likert || {};
  
  likert = (function() {
    'use strict';

    var likert = {

      container: '#main',

      // api: {
      //   list: 'loadbalancer/list',
      // },

      events : {
        '#form-login : submit'  : 'validateLogin',
        '.answer : change'      : 'answerQuestion',
      },

      template: {
        graphItem    : '#graph-item',
        // headerTheme     : '#header-theme'
        // itemForm  : '#load-balance-item-form',
      },

      data: {
        users: {},
        answers: {}
      }, 

      init: function(){
        this.utils.loadTemplates();
        this.utils.loadEvents();
        // this.insertQuestion()
        this.loadData();
      },

      loadData: function(){
        var that = this;
        that.data.users = $.Storage.loadItem('users');
        _.each(that.data.users, function(user,key){
          that.data.users
          that.data.answers[ user ] = $.Storage.loadItem(user);
        });
        that.plotGraph();
      },

      plotGraph: function () {
        var that = this;
        var $graphArea = $('#graph-area ol');

        var dataH = [];

        _.each(brands, function(brand, keyBrand){
          var brandResult = {
            name: brand.name,
            answeredUsers : 0,
            answeredQuestions : 0,
            totalPoints: 0,
            answers : {
              1 : { question: 1 ,total: 0, percent: 0 },
              2 : { question: 2 ,total: 0, percent: 0 },
              3 : { question: 3 ,total: 0, percent: 0 },
              4 : { question: 4 ,total: 0, percent: 0 },
              5 : { question: 5 ,total: 0, percent: 0 },
            }
          };
          _.each( that.data.answers, function( userAnswers, userName ){
            // brandResult.total += _.reduce( userAnswers[keyBrand].answers , function(resp1, resp2){ return parseInt(resp1, 10) + parseInt(resp2, 10); }, 0);
            brandResult.answeredUsers++;
            _.each( userAnswers[keyBrand].answers, function( answer, answerId ){
              brandResult.answeredQuestions++;
              brandResult.answers[answer].total++;
              brandResult.totalPoints += parseInt(answer, 10)
            });
          });// each user answer
          console.log( brandResult )
          _.each( brandResult.answers, function(answer, answerId){
            brandResult.answers[ answerId ].percent = (brandResult.answers[answerId].total * 100) / brandResult.answeredQuestions / 2
          })
          dataH.push( brandResult );
        });// each brand
        
        var dataH2 = {
          brands : []
        };
        dataH2.brands =  _.sortBy(dataH,  'totalPoints' ).reverse();
        console.dir(dataH2)
        
        var html = likert.template.graphItem(dataH2);
        $('body').addClass('white');
        $graphArea.html( html );
        $('.brand-bar').each(function(){
          var $mid = $(this).find('.answer-3');
          var midLef = $mid.position().left;
          var midWid = $mid.width();
          var barMid = $(this).width()/2
          $(this).find('.answer-1').css( 'marginLeft', barMid- midLef - (midWid/2) )
        });

      },

      utils: {

        loadEvents: function(){
          $.each( likert.events, function(elemEvent, eventAction){
            var elemEvtSplit =  elemEvent.split(' : ');
            $(likert.container).delegate(elemEvtSplit[0], elemEvtSplit[1], function(evt){
              likert[eventAction](evt, $(this), $(this).data('id'));
            });
          });
        }, // loadEvents

        loadData: function(data, url, callback, $el ){
          var that = this;
          $.ajax({
            contentType : "application/json; charset=utf-8",
            data        : JSON.stringify(data),
            dataType    : "json",
            type        : "POST",
            url         : that.api[url],
            success: function (data) {
              likert[callback]( data , $el);
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
              console.error(XMLHttpRequest, textStatus, errorThrown)
            }
          });
        },

        loadTemplates: function(){
          $.each( likert.template, function( name, elem ){
            likert.template[name]  = Handlebars.compile( $(elem).html() );
          });
        }, // loadTemplates

        renderTemplate: function (template, data) {
          return likert.template[template].replace(/\{\{(.+?)\}\}/g, function replacer(match, param, offset, string) {
            return data[param] ? data[param] : '';
          });
        } // renderTemplate

      } //  utils
    }

    return likert;


  }());




  likert.init();
  
});

