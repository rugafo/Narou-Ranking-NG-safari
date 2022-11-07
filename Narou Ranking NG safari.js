// ==UserScript==// ==UserScript==
// @name         Narou Ranking NG safari
// @namespace    https://github.com/rugafo/Narou-Ranking-NG-safari/new/main
// @version      1.2
// @description  小説家になろう（厳密には小説を読もう）ランキングでのNGフィルタリング機能を提供
// @author       rugafo
// @match        https://yomou.syosetu.com/rank/genrelist/type/*
// @match        https://yomou.syosetu.com/rank/list/type/*
// @match        https://yomou.syosetu.com/rank/isekailist/type/*
// @grant        GM_addStyle
// @grant        GM_deleteValue
// @grant        GM_getValue
// @grant        GM_listValues
// @grant        GM_setValue
// ==/UserScript==


/*
ユーザースクリプトの説明
    注意！このスクリプトはJavaScript練習を兼ねたものです！
    小説を読もう！の「ジャンル別ランキング」「総合ランキング」ページで動作するスクリプトで、
    ランキング内、小説タイトル横に追加する「表示/非表示」ボタンを押すと、その小説はNGに登録され説明文が折りたたまれます。
    NG登録はGM setValueで保存され、ページ遷移に耐えます。
    登録したNGを消す方法は画面右下のフローティングボタン「delete ng data」を押して下さい。
*/
document.addEventListener("DOMContentLoaded",function(){
});

console.log(GM_listValues())


// セーブデータ・読込キー
// 現行
const NAROU_NG_IDS_KEY = 'narou_ng_ids';
/*
// 下記に更新予定
const NG_NOVEL_KEY = 'nrng_novel_ids;
const NG_AUTHOR_KEY = 'nrng_author_ids;
const NG_TAG_KEY = 'nrng_tags;
*/


// セーブデータ・ロード関数
function load_savedata(key) {
    const DATA = GM_getValue(key);
    return DATA ? DATA.split(' ') : [];// 良くない書き方？
}


// セーブデータ・セーブ関数
function save_savedata(key, array) {
    GM_setValue(key, array.join(' '));
}


function delete_savedata(key) {
    switch (key) {
        case NAROU_NG_IDS_KEY:
            if (window.confirm('NG小説IDを全削除しますか？')) {
                GM_deleteValue(key);
                window.alert('NG小説IDを全削除しました');
            }
            break;

        default:
            break;
    }

}


// ランキング内の小説をノードリストとして所得
var ranking_nodelist = document.querySelectorAll('ul.ranking');

var ranked_id_arr = [];
// ランキング内小説ID配列とNG小説ID配列
var e =0;
for (let i = 1; i <= 300 ;i++){
    var id = "best"+i;
    var brr;
    var trr = document.getElementById(id);
    if(trr != null){
    brr =trr.href.substring(26, 33);
    ranked_id_arr[i-1-e] = brr;
    //alert(brr)
    }
  else e++
}
var ng_novel_ids_array = load_savedata(NAROU_NG_IDS_KEY);


// スクリプトでNG小説を隠すのに使うCSS要素を作成して追加
GM_addStyle('.censored { display: none; }');


function toggle(num) {
    //var target_classList = ranking_nodelist[num].childNodes[3].classList;
    var target_classList = ranking_nodelist[num].classList;
    var target_id = ranked_id_arr[num];
    if (target_classList.contains('censored')) {
        target_classList.remove('censored');
        ng_novel_ids_array = ng_novel_ids_array.filter(id => id != target_id);
    } else {
        target_classList.add('censored');
        var bar= ranking_nodelist[num].nextElementSibling
        bar.classList.add('censored');
        // alert(bar.innerHTML);
        ng_novel_ids_array.push(target_id);

    }
    //console.log('NG小説ID一覧が更新されました。');
    //console.log(ng_novel_ids_array);
    save_savedata(NAROU_NG_IDS_KEY, ng_novel_ids_array);
}


// NG登録ボタンを↑のリスト個数分つくって配列に追加
var button_array = [];
for (let i = 0; i < ranking_nodelist.length; i++) {
    button_array[i] = document.createElement('button');
    button_array[i].innerText = '非表示';
    button_array[i].addEventListener('click', function () {
        toggle(i);

    });// ループ内関数宣言は駄目らしい? 動いているが…
    ranking_nodelist[i].firstElementChild.appendChild(button_array[i]);
}


// メイン部分。ここどうにかならないものか
// NG小説IDが見つかったとき
if (ng_novel_ids_array.length > 0) {
    console.log('保存されたNG小説IDが見つかりました。');
    console.log(ng_novel_ids_array.join(' '));
    let key_array = ng_novel_ids_array.slice();
    for (let i = 0; i < ranked_id_arr.length; i++) {
        for (let j = 0; j < key_array.length; j++) {

            let soeji = ranked_id_arr.indexOf(key_array[j]);
            if (soeji != -1) {
                //ranking_list_nodelist[soeji].lastElementChild.classList.add('censored');
                ranking_nodelist[soeji].classList.add('censored');
                var bar= ranking_nodelist[soeji].nextElementSibling
                bar.classList.add('censored');
                key_array.splice(j, 1);
            }
        }
    }
} else {
    //console.log('保存されたNG小説IDは見つかりませんでした。');
}


// フロートNGメニュー
GM_addStyle('.floated { position: fixed; right: 0; bottom: 0; }')

const FLOAT_NG_MENU = document.createElement('div');
FLOAT_NG_MENU.classList.add('floated');
document.body.appendChild(FLOAT_NG_MENU);
var bottontime=0;
const EXPRESS_SAVE_DATA_BUTTON = document.createElement('button');
EXPRESS_SAVE_DATA_BUTTON.innerText = 'NG一覧';
EXPRESS_SAVE_DATA_BUTTON.addEventListener('click', function () {
    //alert(load_savedata(NAROU_NG_IDS_KEY));
    if(bottontime == 0){
        bottontime = 1;
        var tear = document.createElement("textarea")
        tear.appendChild(document.createTextNode(load_savedata(NAROU_NG_IDS_KEY)));
        tear.id = "memoarea";
        tear.setAttribute("rows","4");
        tear.setAttribute("cols","40");
        document.body.insertBefore(tear,document.body.firstElementChild);

        var btn = document.createElement("input");
        btn.setAttribute("type","button");
        btn.setAttribute("value","保存");
        tear.parentElement.insertBefore(btn,tear.nextSibling);

        var tojiru = document.createElement("input");
        tojiru.setAttribute("type","button");
        tojiru.setAttribute("value","閉じる");
        btn.parentElement.insertBefore(tojiru,btn.nextSibling);

        btn.addEventListener('click', function () {
            var elem = document.getElementById('memoarea').value;
            ng_novel_ids_array = elem;
            GM_setValue(NAROU_NG_IDS_KEY, ng_novel_ids_array);
            document.body.removeChild(tear);
            document.body.removeChild(btn);
            document.body.removeChild(tojiru);
            bottontime=0;
        });
        tojiru.addEventListener('click', function () {
            document.body.removeChild(tear);
            document.body.removeChild(btn);
            document.body.removeChild(tojiru);
            bottontime=0;
        });
    };

});
document.querySelector('.floated').appendChild(EXPRESS_SAVE_DATA_BUTTON);

/*
const EXPORT_BUTTON = document.createElement('button');
EXPORT_BUTTON.innerText = 'NGをエクスポート';
EXPORT_BUTTON.addEventListener('click', function () {
    if (ng_novel_ids_array.length > 0) {
        var csv = '';
        csv = ng_novel_ids_array

      var filename = 'ng_novel_ids_一覧.csv';

      var UTF_8_BOM = '%EF%BB%BF';
      var data =
        'data:text/csv;charset=utf-8,' + UTF_8_BOM + encodeURIComponent(csv);

      var element = document.createElement('a');
      element.href = data;
      element.setAttribute('download', filename);
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);

     //   window.alert('NG小説ID一覧がエクスポートされました。')
    } else {
        window.alert('NG小説IDが見つかりません。')
    }
});
document.querySelector('.floated').appendChild(EXPORT_BUTTON);
*/
//function hogehoge() {
//    window.alert('hogehoge')
//}


const DELETE_SAVE_DATA_BUTTON = document.createElement('button');
DELETE_SAVE_DATA_BUTTON.innerText = 'NG全削除';
DELETE_SAVE_DATA_BUTTON.addEventListener('click', function () { delete_savedata(NAROU_NG_IDS_KEY); });
document.querySelector('.floated').appendChild(DELETE_SAVE_DATA_BUTTON);

// @name         Narou Ranking NG safari
// @namespace    https://github.com/rugafo/Narou-Ranking-NG-safari/new/main
// @version      1.2
// @description  小説家になろう（厳密には小説を読もう）ランキングでのNGフィルタリング機能を提供
// @author       rugafo
// @match        https://yomou.syosetu.com/rank/genrelist/type/*
// @match        https://yomou.syosetu.com/rank/list/type/*
// @grant        GM_addStyle
// @grant        GM_deleteValue
// @grant        GM_getValue
// @grant        GM_listValues
// @grant        GM_setValue
// ==/UserScript==

/*
ユーザースクリプトの説明
    注意！このスクリプトはJavaScript練習を兼ねたものです！
    小説を読もう！の「ジャンル別ランキング」「総合ランキング」ページで動作するスクリプトで、
    ランキング内、小説タイトル横に追加する「表示/非表示」ボタンを押すと、その小説はNGに登録され説明文が折りたたまれます。
    NG登録はGM setValueで保存され、ページ遷移に耐えます。
    登録したNGを消す方法は画面右下のフローティングボタン「delete ng data」を押して下さい。
*/


console.log(GM_listValues())


// セーブデータ・読込キー
// 現行
const NAROU_NG_IDS_KEY = 'narou_ng_ids';
/*
// 下記に更新予定
const NG_NOVEL_KEY = 'nrng_novel_ids;
const NG_AUTHOR_KEY = 'nrng_author_ids;
const NG_TAG_KEY = 'nrng_tags;
*/


// セーブデータ・ロード関数
function load_savedata(key) {
    const DATA = GM_getValue(key);
    return DATA ? DATA.split(' ') : [];// 良くない書き方？
}


// セーブデータ・セーブ関数
function save_savedata(key, array) {
    GM_setValue(key, array.join(' '));
}


function delete_savedata(key) {
    switch (key) {
        case NAROU_NG_IDS_KEY:
            if (window.confirm('NG小説IDを全削除しますか？')) {
                GM_deleteValue(key);
                window.alert('NG小説IDを全削除しました');
            }
            break;

        default:
            break;
    }

}


// ランキング内の小説をノードリストとして所得
var ranking_nodelist = document.querySelectorAll('ul.ranking');

var ranked_id_arr = [];
var brr;
// ランキング内小説ID配列とNG小説ID配列

for (let i = 1; i <= 100; i++){
    brr = document.getElementById("best" + i).href.substring(26, 33);
    ranked_id_arr[i-1] = brr;
}
var ng_novel_ids_array = load_savedata(NAROU_NG_IDS_KEY)


// スクリプトでNG小説を隠すのに使うCSS要素を作成して追加
GM_addStyle('.censored { display: none; }')


function toggle(num) {
    //var target_classList = ranking_nodelist[num].childNodes[3].classList;
    var target_classList = ranking_nodelist[num].classList;
    var target_id = ranked_id_arr[num];
    if (target_classList.contains('censored')) {
        target_classList.remove('censored');
        ng_novel_ids_array = ng_novel_ids_array.filter(id => id != target_id);
    } else {
        target_classList.add('censored');
        var bar= ranking_nodelist[num].nextElementSibling
        bar.classList.add('censored');
        // alert(bar.innerHTML);
        ng_novel_ids_array.push(target_id);

    }
    //console.log('NG小説ID一覧が更新されました。');
    //console.log(ng_novel_ids_array);
    save_savedata(NAROU_NG_IDS_KEY, ng_novel_ids_array);
}


// NG登録ボタンを↑のリスト個数分つくって配列に追加
var button_array = [];
for (let i = 0; i < ranking_nodelist.length; i++) {
    button_array[i] = document.createElement('button');
    button_array[i].innerText = '非表示';
    button_array[i].addEventListener('click', function () {
        toggle(i);

    });// ループ内関数宣言は駄目らしい? 動いているが…
    ranking_nodelist[i].firstElementChild.appendChild(button_array[i]);
}


// メイン部分。ここどうにかならないものか
// NG小説IDが見つかったとき
if (ng_novel_ids_array.length > 0) {
    console.log('保存されたNG小説IDが見つかりました。');
    console.log(ng_novel_ids_array.join(' '));
    let key_array = ng_novel_ids_array.slice();
    for (let i = 0; i < ranked_id_arr.length; i++) {
        for (let j = 0; j < key_array.length; j++) {

            let soeji = ranked_id_arr.indexOf(key_array[j]);
            if (soeji != -1) {
                //ranking_list_nodelist[soeji].lastElementChild.classList.add('censored');
                ranking_nodelist[soeji].classList.add('censored');
                var bar= ranking_nodelist[soeji].nextElementSibling
                bar.classList.add('censored');
                key_array.splice(j, 1);
            }
        }
    }
} else {
    //console.log('保存されたNG小説IDは見つかりませんでした。');
}


// フロートNGメニュー
GM_addStyle('.floated { position: fixed; right: 0; bottom: 0; }')

const FLOAT_NG_MENU = document.createElement('div');
FLOAT_NG_MENU.classList.add('floated');
document.body.appendChild(FLOAT_NG_MENU);
var bottontime=0;
const EXPRESS_SAVE_DATA_BUTTON = document.createElement('button');
EXPRESS_SAVE_DATA_BUTTON.innerText = 'NG一覧';
EXPRESS_SAVE_DATA_BUTTON.addEventListener('click', function () {
    //alert(load_savedata(NAROU_NG_IDS_KEY));
    if(bottontime == 0){
        bottontime = 1;
        var tear = document.createElement("textarea")
        tear.appendChild(document.createTextNode(load_savedata(NAROU_NG_IDS_KEY)));
        tear.id = "memoarea";
        tear.setAttribute("rows","4");
        tear.setAttribute("cols","40");
        document.body.insertBefore(tear,document.body.firstElementChild);

        var btn = document.createElement("input");
        btn.setAttribute("type","button");
        btn.setAttribute("value","保存");
        tear.parentElement.insertBefore(btn,tear.nextSibling);

        var tojiru = document.createElement("input");
        tojiru.setAttribute("type","button");
        tojiru.setAttribute("value","閉じる");
        btn.parentElement.insertBefore(tojiru,btn.nextSibling);

        btn.addEventListener('click', function () {
            var elem = document.getElementById('memoarea').value;
            ng_novel_ids_array = elem;
            GM_setValue(NAROU_NG_IDS_KEY, ng_novel_ids_array);
            document.body.removeChild(tear);
            document.body.removeChild(btn);
            document.body.removeChild(tojiru);
            bottontime=0;
        });
        tojiru.addEventListener('click', function () {
            document.body.removeChild(tear);
            document.body.removeChild(btn);
            document.body.removeChild(tojiru);
            bottontime=0;
        });
    };

});
document.querySelector('.floated').appendChild(EXPRESS_SAVE_DATA_BUTTON);

/*
const EXPORT_BUTTON = document.createElement('button');
EXPORT_BUTTON.innerText = 'NGをエクスポート';
EXPORT_BUTTON.addEventListener('click', function () {
    if (ng_novel_ids_array.length > 0) {
        var csv = '';
        csv = ng_novel_ids_array

      var filename = 'ng_novel_ids_一覧.csv';

      var UTF_8_BOM = '%EF%BB%BF';
      var data =
        'data:text/csv;charset=utf-8,' + UTF_8_BOM + encodeURIComponent(csv);

      var element = document.createElement('a');
      element.href = data;
      element.setAttribute('download', filename);
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);

     //   window.alert('NG小説ID一覧がエクスポートされました。')
    } else {
        window.alert('NG小説IDが見つかりません。')
    }
});
document.querySelector('.floated').appendChild(EXPORT_BUTTON);
*/
//function hogehoge() {
//    window.alert('hogehoge')
//}


const DELETE_SAVE_DATA_BUTTON = document.createElement('button');
DELETE_SAVE_DATA_BUTTON.innerText = 'NG全削除';
DELETE_SAVE_DATA_BUTTON.addEventListener('click', function () { delete_savedata(NAROU_NG_IDS_KEY); });
document.querySelector('.floated').appendChild(DELETE_SAVE_DATA_BUTTON);
