try { window.resizeTo(1350, 860); } catch(e) {}
var daysMin = ['пн','вт','ср','чт','пт','сб','вс'], dayNames = ['Понедельник','Вторник','Среда','Четверг','Пятница','Суббота','Воскресенье'];
var data = {}, currentTheme = "black", isCleared = false;
var ths = {
    black: { bg: "#1e1e1e", card: "#2d2d2d", text: "#fff", input: "#3d3d3d", border: "#555" },
    gray:  { bg: "#444654", card: "#343541", text: "#ececf1", input: "#40414f", border: "#565869" },
    white: { bg: "#f0f2f5", card: "#fff", text: "#202123", input: "#f7f7f8", border: "#d9d9e3" }
};
function getPath() {
    try { var fso = new ActiveXObject("Scripting.FileSystemObject"), sh = new ActiveXObject("WScript.Shell"); return fso.BuildPath(sh.CurrentDirectory, "сохранения ежедневника.txt"); } catch(e) { return "сохранения ежедневника.txt"; }
}
function load() {
    try {
        var fso = new ActiveXObject("Scripting.FileSystemObject"), path = getPath();
        if (fso.FileExists(path)) {
            var file = fso.OpenTextFile(path, 1, false, -1), content = file.ReadAll(); file.Close();
            var p = eval('(' + content + ')'); data = p.data || {}; currentTheme = p.theme || "black"; return true;
        }
    } catch(e) {}
    return false;
}
function save() { try { var fso = new ActiveXObject("Scripting.FileSystemObject"), f = fso.CreateTextFile(getPath(), true, true); f.Write(JSON.stringify({ data: data, theme: currentTheme })); f.Close(); } catch(e){} }
function setTheme(t) {
    currentTheme = t; var c = ths[t]; document.body.style.backgroundColor = c.bg; document.body.style.color = c.text;
    var divs = document.getElementsByTagName('div');
    for(var i=0; i<divs.length; i++) {
        if(divs[i].className.indexOf('day-column')!==-1 || divs[i].className.indexOf('extra-section')!==-1 || divs[i].className.indexOf('footer-controls')!==-1) divs[i].style.backgroundColor = c.card;
    }
    var el = ['input', 'textarea'];
    for(var j=0; j<el.length; j++) {
        var arr = document.getElementsByTagName(el[j]);
        for(var i=0; i<arr.length; i++) { arr[i].style.backgroundColor = c.input; arr[i].style.color = c.text; arr[i].style.borderColor = c.border; }
    }
    var ids = ['Black', 'Gray', 'White'];
    for(var i=0; i<ids.length; i++) { var b = document.getElementById('themeBtn' + ids[i]); if(b) { b.className = ''; b.style.backgroundColor = c.input; b.style.color = c.text; } }
    var a = document.getElementById('themeBtn' + t.charAt(0).toUpperCase() + t.slice(1)); if(a) a.className = 'active';
    save();
}
if (!load()) {
    for (var d = 0; d < dayNames.length; d++) { data[dayNames[d]] = []; for (var i = 0; i < 12; i++) data[dayNames[d]].push({ text: '', time: '', isWeekly: false }); }
    data.Extra = []; for (var i = 0; i < 20; i++) data.Extra.push({ text: '', checked: false, isWeekly: false });
}
var now = new Date(), diff = (now.getDay() === 0) ? -6 : 1 - now.getDay();
var mon = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diff), planner = document.getElementById('planner');
for (var dIdx = 0; dIdx < dayNames.length; dIdx++) {
    (function(day, idx) {
        var col = document.createElement('div'), d = new Date(mon.getFullYear(), mon.getMonth(), mon.getDate() + idx);
        col.className = 'day-column'; col.setAttribute('id', 'day-col-' + idx);
        col.innerHTML = '<div class="day-header">' + d.getDate() + ' ' + daysMin[idx] + '</div>';
        for (var i = 0; i < 12; i++) {
            (function(n) {
                var row = document.createElement('div'); row.className = 'row-container';
                row.innerHTML = '<span class="task-num">'+(n+1)+'.</span><input type="text" class="task-time" placeholder="--:--" maxlength="5" value="'+(data[day][n].time||'')+'"><textarea class="task-input">'+data[day][n].text+'</textarea><button class="btn-weekly">Еж</button>';
                var tIn = row.getElementsByTagName('input')[0], textIn = row.getElementsByTagName('textarea')[0], btn = row.getElementsByTagName('button')[0];
                if (data[day][n].isWeekly) { btn.className = 'btn-weekly active'; textIn.className += ' weekly-text'; tIn.className += ' weekly-text'; }
                textIn.oninput = function() { data[day][n].text = textIn.value; save(); };
                tIn.oninput = function() { data[day][n].time = tIn.value; save(); };
                btn.onclick = function() {
                    var act = (btn.className.indexOf('active') === -1); btn.className = act ? 'btn-weekly active' : 'btn-weekly';
                    textIn.className = act ? 'task-input weekly-text' : 'task-input'; tIn.className = act ? 'task-time weekly-text' : 'task-time';
                    data[day][n].isWeekly = act; save(); setTheme(currentTheme);
                };
                col.appendChild(row);
            })(i);
        }
        planner.appendChild(col);
    })(dayNames[dIdx], dIdx);
}
var extraGrid = document.getElementById('extraGrid');
for (var i = 0; i < 20; i++) {
    (function(n) {
        var item = document.createElement('div'); item.className = 'extra-item';
        var row = document.createElement('div'); row.className = 'row-container';
        row.innerHTML = '<input type="checkbox" class="task-checkbox" '+(data.Extra[n].checked?'checked':'')+'><textarea class="task-input">'+(data.Extra[n].text||'')+'</textarea><button class="btn-weekly">Еж</button>';
        var chk = row.getElementsByTagName('input')[0], textIn = row.getElementsByTagName('textarea')[0], btn = row.getElementsByTagName('button')[0];
        if (data.Extra[n].isWeekly) { btn.className = 'btn-weekly active'; textIn.className += ' weekly-text'; }
        if (data.Extra[n].checked) { textIn.className += ' completed-text'; }
        chk.onchange = function() { data.Extra[n].checked = chk.checked; textIn.className = chk.checked ? 'task-input completed-text' + (data.Extra[n].isWeekly?' weekly-text':'') : 'task-input' + (data.Extra[n].isWeekly?' weekly-text':''); save(); };
        textIn.oninput = function() { data.Extra[n].text = textIn.value; if (chk.checked) { chk.checked = false; data.Extra[n].checked = false; textIn.className = 'task-input' + (data.Extra[n].isWeekly ? ' weekly-text' : ''); } save(); };
        btn.onclick = function() { var act = (btn.className.indexOf('active') === -1); btn.className = act ? 'btn-weekly active' : 'btn-weekly'; data.Extra[n].isWeekly = act; textIn.className = 'task-input' + (act ? ' weekly-text' : '') + (chk.checked ? ' completed-text' : ''); save(); };
        item.appendChild(row); extraGrid.appendChild(item);
    })(i);
}
function clearTasks() {
    for (var d = 0; d < dayNames.length; d++) { for (var i = 0; i < 12; i++) if (!data[dayNames[d]][i].isWeekly) { data[dayNames[d]][i].text = ''; data[dayNames[d]][i].time = ''; } }
    for (var i = 0; i < 20; i++) { if (!data.Extra[i].isWeekly) { data.Extra[i].text = ''; data.Extra[i].checked = false; } else { data.Extra[i].checked = false; } }
    save(); window.location.reload();
}
document.getElementById('resetBtn').onclick = function() { if (confirm('Сбросить обычные записи?')) clearTasks(); };
var lastMin = -1;
function checkTime() {
    var n = new Date(), m = n.getMinutes(); if (m === lastMin) return; lastMin = m;
    var mo = String(n.getMonth()+1), dt = String(n.getDate()), hr = String(n.getHours()), mn = String(m);
    if(mo.length<2) mo='0'+mo; if(dt.length<2) dt='0'+dt; if(hr.length<2) hr='0'+hr; if(mn.length<2) mn='0'+mn;
    document.getElementById('liveClock').innerText = n.getFullYear() + '.' + mo + '.' + dt + ' ' + hr + ':' + mn;
    var jsDay = n.getDay(), currentDayIndex = (jsDay === 0) ? 6 : jsDay - 1; 
    for (var i = 0; i < 7; i++) { var col = document.getElementById('day-col-' + i); if (col) col.className = (i === currentDayIndex) ? 'day-column today' : 'day-column'; }
    if (n.getDay() === 0 && n.getHours() === 23 && m === 59) { if (!isCleared) { isCleared = true; clearTasks(); } } else { isCleared = false; }
}
setTimeout(function() { setTheme(currentTheme); }, 200);
setInterval(checkTime, 3000); checkTime();
// Текущая версия программы (меняйте её вручную при выпуске обновлений)
var LOGIC_VERSION = "R 1.0.0"; 
