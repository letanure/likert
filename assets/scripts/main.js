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
        questionItem    : '#question-item',
        headerTheme     : '#header-theme'
        // itemForm  : '#load-balance-item-form',
      },

      init: function(){
        this.utils.loadTemplates();
        this.utils.loadEvents();
        // this.insertQuestion()
        // this.list();
      },

      validateLogin: function (evt, $el) {
        evt.preventDefault();
        var $name = $('#login-name');
        var $error = $('#error-name');
        if( $name.val() == '' || $name.val().length < 3 ){
          $error.text('Digite um nome');
          return;
        }
        this.data.userName = $name.val();
        $error.empty();
        this.hideLogin();
        this.storeUser($name.val());
      },

      storeUser: function(name){
        console.log(name)
        var usersStore = $.Storage.loadItem('users');
        var users = [];
        if( !usersStore ){
          console.log('nao existem usuarios')
          users.push(name);
          $.Storage.saveItem('users',users);
        } else{
          console.dir(  usersStore );
          if( !_.contains(usersStore, name) ){
            usersStore.push( name)
            $.Storage.saveItem('users',usersStore);
          }
        }
      }, 

      hideLogin: function () {
        var that = this;
        $('body').addClass('white')
        $('#login').animate({
          opacity: 0,
          height: 0
        }, 500, 'linear', function () {
          that.insertQuestion();
        })
      },

      data: {
        currentBrand : 0,
        currentQuestion: 0,
        userName: 'foo',
      }, 

      insertQuestion: function () {
        if( questions[likert.data.currentQuestion] == undefined ){
          console.log('FIM')
          return;
        }
        var data = {
          brandId     : likert.data.currentBrand,
          questionId  : likert.data.currentQuestion,
          brand       : brands[ likert.data.currentBrand ].name,
          category    : brands[ likert.data.currentBrand ].category,
          sub         : brands[ likert.data.currentBrand ].sub,
          question    : questions[ likert.data.currentQuestion ].label,
          title       : questions[ likert.data.currentQuestion ].title
        }
        var html = '';
        var dif = -62;
        // if( data.brandId === 0  ){
          html += likert.template.headerTheme(data);
          dif = -182
        // }
        html += likert.template.questionItem(data) 
        $('#questions-list').append( html);
        var $question = $('#question-' + data.questionId + '-' +data.brandId );
        $question.find('.question').animate({
          opacity: 1
        }, 'fast', 'linear',function(){
          $question.find('.options').animate({
            opacity: 1
          }, 'fast');
          $('body').animate({
            scrollTop: $question.offset().top + dif
          })
        });
      },

      answerQuestion: function(evt, $el){
        var $optionsList = $el.parent('label').parent('li').parent('ol');
        var questionId = $el.data('question');
        var brandId = $el.data('brand');
        var answer = $el.val();
        brands[brandId].answers[questionId] = answer;
        console.log(answer)
        $.Storage.saveItem( likert.data.userName , brands );
        if( $optionsList.find('.selected').size() ){
          $optionsList.find('.selected').removeClass('selected');
          $el.parent('label').addClass('selected')//.parent('li').siblings('li').slideUp('fast', function(){});
          var $nextQuestion = $optionsList.parents('.question-item').next().eq(0);
          $('body').animate({
            scrollTop: $nextQuestion.offset().top - 72
          })
        }else{
          $el.parent('label').addClass('selected')//.parent('li').siblings('li').slideUp('fast', function(){});
          likert.nextQuestion()
        }
      },

      nextQuestion: function(){
        if( likert.data.currentBrand + 1  === brands.length ){
          likert.data.currentBrand = 0;
          likert.data.currentQuestion++;
        } else{
          likert.data.currentBrand++;
        }
        this.insertQuestion()
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

