// global document, window

const UI_HTML = `
<div id="ui">
  <div id="left-box">
    <select id="songs" multiple size="6"></select>
  </div>
  <div id="right-box">
    <div style="width:45%">
      <label>Minor chords display:</label>
      <div class="radio">
        <label><input type="radio" id="minus" name="minor" checked>Minus sign (Bb-)</label>
      </div>
      <div class="radio">
        <label><input type="radio" id="m" name="minor">Letter "m" (Bbm)</label>
      </div>
      <div class="radio">
        <label><input type="radio" id="small" name="minor">Small letters (bb)</label>
      </div>
      <br/>
      <div class="checkbox">
        <label><input type="checkbox" id="ui-useh">Use H for B chords</label>
      </div>
    </div>
    <table border="0" width="45%">
      <tr><td colspan="2">
        <div class="checkbox">
          <label><input type="checkbox" id="ui-hilite" checked>Highlighting</label>
        </div>
      </td></tr>
      <tr><td>
        <label for="ui-transpose">Transpose (half tones): </label>
      </td><td>
        <input id = "ui-transpose" type="number" value="0" min="-6" max="6" style="display:inline; width:60px">
      </tr><tr><td>
        <label for="ui-fontsize">Font size: </label>
      </td><td>
        <input id = "ui-fontsize" type="number" value="16" min="4" max="256" style="display:inline; width:60px">
      </td></tr>
      <tr><td colspan="2">
        <label for="ui-file">Select iReal Pro playlist: </label>
        <input type="file" id="ui-file" style="margin-top: 5px"/>
      </td></tr>
    </table>
  </div>
</div>
`;

const PAGE_HTML = `
<div id="page">
  <div id="chords" style="font-size:16pt"></div>
</div>
`;

const onLoad = async () => {
  console.log('DEMO2 YEEEEAH');
  const container = document.getElementById("ireal-container");
  container.innerHTML = UI_HTML + PAGE_HTML;
  document.body.appendChild(container);

  var playlist;
  var options = {
    minor: "minus",
    transpose: 0,
    useH: false,
    hilite: true,
  };

  function makePlaylist(text) {
    playlist = new Playlist(text);
    var lbHtml = "";
    var chordsHtml = "";
    for (var i = 0; i < playlist.songs.length; i++) {
      lbHtml += `<option value="${i}">${playlist.songs[i].title}</option>`;
      chordsHtml += `<div id="song-${i}"></div>`;
    }
    document.getElementById("songs").innerHTML = lbHtml;
    document.getElementById("chords").innerHTML = chordsHtml;
  }

  /**
   * Render a song into the container "#song-index".
   * @param {int} index - the song index
   */
  function renderSong(index) {
    var song = playlist.songs[index];
    var r = new iRealRenderer();
    r.parse(song);
    song = r.transpose(song, options);
    var container = document.getElementById("song-" + index);
    container.innerHTML = `<h3>${song.title} (${song.key
      .replace(/b/g, "\u266d")
      .replace(/#/g, "\u266f")})</h3><h5>${song.composer}</h5>`;
    r.render(song, container, options);
  }

  function renderSelected() {
    var selected = document.getElementById("songs").options;
    selected = [...selected]
      .filter((option) => option.selected)
      .map((el) => +el.value);
    for (var i = 0; i < playlist.songs.length; i++) {
      if (selected.includes(i)) renderSong(i);
      else document.getElementById(`song-${i}`).innerHTML = "";
    }
  }

  document
    .getElementById("songs")
    .addEventListener("change", () => renderSelected());

  document.querySelectorAll('[name="minor"]').forEach((el) => {
    el.addEventListener("click", (ev) => {
      var mode = ev.target.id;
      options.minor = mode;
      renderSelected();
    });
  });

  document.getElementById("ui-useh").addEventListener("click", (ev) => {
    options.useH = ev.target.checked;
    renderSelected();
  });

  document.getElementById("ui-hilite").addEventListener("click", (ev) => {
    options.hilite = ev.target.checked;
    renderSelected();
  });

  document.getElementById("ui-transpose").addEventListener("input", (ev) => {
    options.transpose = +ev.target.value;
    renderSelected();
  });
  document.getElementById("ui-transpose").addEventListener("change", (ev) => {
    options.transpose = +ev.target.value;
    renderSelected();
  });

  document.getElementById("ui-fontsize").addEventListener("input", (ev) => {
    document.getElementById("chords").style.fontSize = ev.target.value + "pt";
  });
  document.getElementById("ui-fontsize").addEventListener("change", (ev) => {
    document.getElementById("chords").style.fontSize = ev.target.value + "pt";
  });

  document.getElementById("ui-file").addEventListener("change", (ev) => {
    var f = ev.target.files[0];
    var reader = new FileReader();
    reader.addEventListener("loadend", () => {
      if (reader.error) alert(`Cannot read file ${f.name}: ${reader.error}`);
      else makePlaylist(reader.result);
    });
    reader.readAsText(f, "utf-8");
  });

  // Did the import of our DemoPlaylist.html file work?
  var el = document.querySelectorAll('link[rel="ireal-playlist"]');
  let playlistSource = 'DemoPlaylist.html';
  if (el.length) {
    playlistSource = el[0].href;
  }
  let response = await fetch(playlistSource);
  if (response.ok) {
    makePlaylist(await response.text());
  }
};

if (document.readyState === "complete") {
  onLoad();
} else {
  window.addEventListener("load", onLoad);
}
