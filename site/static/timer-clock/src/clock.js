
    var margin = { top: 20, right: 10, bottom: 10, left: 10 };
    var w = d3.select('.clock').node().clientWidth - margin.left - margin.right;
    var h = d3.select('.clock').node().clientHeight - margin.top - margin.bottom;

    // radius of entire figure
    var r = Math.min(w, h) / 2;

var audio = document.createElement("AUDIO")
document.body.appendChild(audio);
audio.src = "./chinese-gong-daniel_simon.mp3"

var 
  ONE_SECOND = 250
  , moveHandleIn = .025
  // ONE_SECOND = 1000
  // , moveHandleIn = .1
  , endMinute = 0
  , endSecond = 0
  , endTime = 0
  // , endTimeInSeconds
  , currentTime = 0
  , selectedAngle
  , currentAngle
  , timer
  , stopBtn = document.getElementById('stop-clock')
  , resetBtn = document.getElementById('reset-clock')
  ;

function stopClock() {
  document.querySelector('body').className = "";
  document.getElementById('status').className = "";
  clearTimeout(timer);
}

function resetClock() {
  stopClock();
  moveHandle(null, 0);
}

stopBtn.onclick = stopClock;
resetBtn.onclick = resetClock;

function tick() {
  if (currentAngle > 0) {
    currentAngle = currentAngle - moveHandleIn;
  }
  if (currentAngle < 0) {
    currentAngle = 0;
    currentTime = 0;
    audio.play();
  }

  // console.log('tick', 'endTime', endTime);
  // console.log('tick', 'endMinute', endMinute);
  // console.log('tick', 'selectedAngle', selectedAngle);
  // console.log('tick', 'currentAngle', currentAngle);

  moveHandle(null, currentAngle);

  if (currentAngle > 0) {
    clearTimeout(timer);
    timer = setTimeout(tick, ONE_SECOND);
    document.querySelector('body').className = "running";
    document.getElementById('status').className = "running";
  } else {
    document.querySelector('body').className = "";
    document.getElementById('status').className = "";
  }
}

// drag behavior
var drag = d3.behavior.drag()
  .on('dragstart', dragstart)
  .on('dragend', dragend)
  .on('drag', drag);

function dragend() {
  endTime = endMinute*1;
  selectedAngle = (endMinute * 1) * 6;
  // snap to selected minute
  moveHandle(null, selectedAngle);
  // start ticking
  tick(this);
}

function dragstart() {
  clearTimeout(timer);
  d3.select(this).select('.slider-background')
    .transition()
    .attr('r', clock.sliderR);
}

function drag() {
  var mouse = Math.atan2(d3.event.y, d3.event.x);
  moveHandle(mouse);
}


function moveHandle(mouse, angle) {
  if (angle) {
    mouse = (angle - 90) * Math.PI / 180;
  } else if (angle === 0) {
    // console.log('resenting');
    mouse = -1.5707963267948966;
  }
  // This +90 is fucking the reset.
  var deg = angle === 0? 0: angle || mouse / (Math.PI / 180) + 90;
  var arcMouse = deg < 0 ? 360 + deg : deg;
  var which = sliderGroup.attr('class');
  
  currentAngle = arcMouse;
  endMinute = Math.round(currentAngle / 6);
  // endSecond = Math.round(currentAngle / .1);
  // endMinute = angle || Math.round(arcMouse / 6);
  // endSecond = angle || Math.round(arcMouse / .1);

  // console.log('angle', angle, typeof angle)
  // console.log('mouse', mouse)
  // console.log('deg', deg)
  // console.log('arcMouse', arcMouse)
  // console.log('endMinute', endMinute)

  // move slider element
  sliderGroup.select('.slider-background').attr({
    cx: function (d) { return d.ringR * Math.cos(mouse); },
    cy: function (d) { return d.ringR * Math.sin(mouse); }
  });
  sliderGroup.select('.slider').attr({
    cx: function (d) { return d.ringR * Math.cos(mouse) },
    cy: function (d) { return d.ringR * Math.sin(mouse); }
  });
  sliderGroup.select('.content').attr({
    x: function (d) { return d.ringR * Math.cos(mouse) },
    y: function (d) { return d.ringR * Math.sin(mouse) + 5.5; }
  })
    .text(Math.round(endMinute));

  // move hand element
  d3.select('line.' + which)
    .attr({
      x2: function (d) { return d.length * Math.cos(mouse); },
      y2: function (d) { return d.length * Math.sin(mouse); },
    });

  // move arcs
  d3.select('path.' + which)
    .attr({
      d: function (d) {
        var arcR = d.length;
        return arc({
          outerRadius: arcR,
          startAngle: 0,
          endAngle: arcMouse * (Math.PI / 180)
        })
      }
    });
}



    var clock = {
      r: r - 40,
      faceColor: '#FEFEFE', //'#FCFFF5',
      tickColor: '#333333',
      sliderR: 15,
      hands: [
        {
          type: 'second',
          content: 'S',
          value: 0,
          length: r - 85,
          ringR: r - 85,
          color: '#333333',
          arcColor: '#FF0000',
          width: 4,
          labels: d3.range(5, 61, 5),
          scale: d3.scale.linear().domain([0, 59]).range([0, 354])
        },
        {
          type: 'minute',
          content: '0',
          value: 0,
          length: r - 40,
          ringR: r - 40,
          // length: r - 85,
          // ringR: r - 85,
          color: '#333333',
          arcColor: '#FF0000',
          width: 2,
          ticks: d3.range(0, 60), // start, stop, step
          labels: d3.range(5, 61, 5),
          tickLength: 10,
          tickStrokeWidth: 1,
          scale: d3.scale.linear().domain([0, 59]).range([0, 354])
        },
        {
          type: 'hour',
          content: 'H',
          value: 0,
          length: r - 85,
          ringR: r - 85,
          color: '#333333',
          arcColor: '#FF0000',
          width: 8,
          ticks: d3.range(0, 12),
          tickLength: 20,
          tickStrokeWidth: 2,
          scale: d3.scale.linear().domain([0, 11]).range([0, 330])
        }
      ]
    }

    // add arcs for clock
    var arc = d3.svg.arc().innerRadius(0);

    // SVG -> G with margin convention
    var svg = d3.select('.clock').append('svg');
    var g = svg.append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    // Clock Face
    var face = g.append('g')
      .datum(clock)
      .attr('transform', 'translate(' + w / 2 + ',' + r + ')');

    face.append('circle')
      .attr({
        class: 'face',
        r: function (d) { return d.r; },
        fill: function (d) { return d.faceColor; },
        stroke: function (d) { return d.tickColor; },
        'stroke-width': 2
      });

    var ticks = face.selectAll('g')
      .data(function (d) { return d.hands; })
      // .data(function (d) { return d.hands.filter(function (d) { return d.type == 'minute'; }); })
      .enter().append('g')
      // only get ticks for hour, minute
      .filter(function (d, i) { return i > 0; });

    ticks.selectAll('.tick')
      .data(function (d) {
        return d.ticks.map(function (rangeValue) {
          return {
            location: d.scale(rangeValue),
            tickLength: d.tickLength,
            tickStrokeWidth: d.tickStrokeWidth
          }
        })
      })
      .enter().append('line')
      .classed('tick', true)
      .attr({
        x1: 0,
        y1: clock.r,
        x2: 0,
        y2: function (d) { return clock.r - d.tickLength; },
        stroke: clock.tickColor,
        'stroke-width': function (d) { return d.tickStrokeWidth; },
        transform: function (d) { return 'rotate(' + d.location + ')'; }
      });

    face.selectAll('.tick-label')
      .data(function (d) {
        return d3.range(5, 61, 5).map(function (rangeValue) {
          return {
            location: d.hands[0].scale(rangeValue),
            scale: d.hands[0].scale,
            value: rangeValue,
            radius: clock.r - 50
          }
        })
      })
      .enter().append('text')
      .classed('.tick-label', true)
      .text(function (d) { return d.value; })
      .attr({
        'text-anchor': 'middle',
        'fill': clock.tickColor,
        'font-family': 'sans-serif',
        'font-size': 25,
        x: function (d) {
          return d.radius * Math.sin(d.location * (Math.PI / 180));
        },
        y: function (d) {
          return -d.radius * Math.cos(d.location * (Math.PI / 180)) + 4.5;
        }

      });

    // append arcs
    var arcs = face.selectAll('path')
      // .data(function (d) { return d.hands; })
      .data(function (d) { return d.hands.filter(function (d) { return d.type == 'minute'; }); })
      .enter().append('path')
      .attr('class', function (d) { return d.type; })
      .attr({
        fill: function (d) { return d.arcColor; },
        opacity: 0.75
      })

    var hands = face.selectAll('.hand')
      // .data(function (d) { return d.hands; })
      .data(function (d) { return d.hands.filter(function (d) { return d.type == 'minute'; }); })
      .enter().append('line')
      .attr('class', function (d) {
        return 'hands ' + d.type;
      })
      .attr({
        x1: 0,
        y1: 0,
        x2: function (d) { return d.length * Math.cos(270 * (Math.PI / 180)); },
        y2: function (d) { return d.length * Math.sin(270 * (Math.PI / 180)); },
        stroke: function (d) { return d.color; },
        'stroke-width': function (d) { return d.width; },
        'stroke-linecap': 'round'
      });

    // center circle
    face.append('circle')
      .classed('center', true)
      .attr({
        r: r / 60,
        fill: clock.hands[0].color
      });

    var rings = face.selectAll('.outer-ring')
      // .data(function (d) { return d.hands; })
      .data(function (d) { return d.hands.filter(function (d) { return d.type == 'minute'; }); })
      .enter().append('g')
      .classed('outer-ring', true);

    // outer ring
    rings.append('circle')
      .classed('ring', true)
      .attr({
        r: function (d) { return d.ringR; },
        fill: 'transparent',
        stroke: clock.tickColor,
        'stroke-width': 1
      });

    var sliderGroup = rings.append('g')
      .attr('class', function (d) {
        return d.type;
      })
      .style('cursor', 'pointer')
      .on('mouseover', function () {
        d3.select(this).select('.slider-background')
          .transition().attr('r', (clock.sliderR * 1.5) + 10);
      })
      .on('mouseleave', function () {
        d3.select(this).select('.slider-background')
          .transition().attr('r', clock.sliderR * 1.5);
      })
      .call(drag);

    // slider
    sliderGroup.append('circle')
      .classed('slider', true)
      .attr({
        r: clock.sliderR,
        fill: function (d) { return d.color; },
        cx: function (d) { return d.ringR * Math.cos(270 * (Math.PI / 180)) },
        cy: function (d) { return d.ringR * Math.sin(270 * (Math.PI / 180)); }
      });

    // slider content
    sliderGroup.append('text')
      .classed('content', true)
      .text(function (d) { return d.content; })
      .attr({
        fill: 'white',
        'text-anchor': 'middle',
        'font-size': 16,
        'font-family': 'sans-serif',
        x: function (d) { return d.ringR * Math.cos(270 * (Math.PI / 180)) },
        y: function (d) { return d.ringR * Math.sin(270 * (Math.PI / 180)) + 5.5; }
      });