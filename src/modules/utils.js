// Build / update the 'context' object (immutable)
export function getContext(state, settings, metrics, fps) {
	const rect = settings.element.getBoundingClientRect()
	const cols = settings.cols || Math.floor(rect.width / metrics.cellWidth)
	const rows = settings.rows || Math.floor(rect.height / metrics.lineHeight)
	return Object.freeze({
		frame : state.frame,
		time : state.time,
		cols,
		rows,
		metrics,
		width : rect.width,
		height : rect.height,
		settings,
		// Runtime & debug data
		runtime : Object.freeze({
			cycle : state.cycle,
			fps : fps.fps
		})
	})
}

export function calcMetrics(el) {

	const style = getComputedStyle(el)
	const fontFamily = style.getPropertyValue('font-family')
	const fontSize   = parseFloat(style.getPropertyValue('font-size'))
	// https://bugs.webkit.org/show_bug.cgi?id=225695
	const lineHeight = parseFloat(style.getPropertyValue('line-height'))
	let cellWidth, cellHeight

	if (el.nodeName == 'CANVAS') {
		const ctx = el.getContext('2d')
		ctx.font = fontSize + 'px ' + fontFamily
    const textMetric = ctx.measureText(''.padEnd(69, 'X')) //TODO: calc from settings.cols
		cellWidth = textMetric.width / 69
		cellHeight = textMetric.fontBoundingBoxAscent + textMetric.fontBoundingBoxDescent / 69
	} else {
		const span = document.createElement('span')
		el.appendChild(span)
		span.innerHTML = ''.padEnd(69, '╳')
		cellWidth = span.getBoundingClientRect().width / 69
		el.removeChild(span)
	}

	const metrics = {
		aspect : cellWidth / lineHeight,
		cellWidth,
		cellHeight,
		lineHeight,
		fontFamily,
		fontSize,
		// // allow an update of the metrics object.
		_update : function(m) {
			const tmp = calcMetrics(el)
			for(var k in tmp) {
				if (typeof tmp[k] == 'number' || typeof tmp[k] == 'string') {
					m[k] = tmp[k]
				}
			}
		}
	}
	return metrics
}

export function pickKey(obj){
  var keys = Object.keys(obj);
  return keys[ keys.length * Math.random() << 0];
}

// export function cloneCanvas(oldCanvas) {
//   const newCanvas = document.createElement('canvas');
//   const context = newCanvas.getContext('2d');
//   newCanvas.width = oldCanvas.width * 4;
//   newCanvas.height = oldCanvas.height * 4;
  
//   //apply the old canvas to the new one
//   // context.scale(4,4)
//   context.drawImage(oldCanvas, 0, 0, newCanvas.width, newCanvas.height );

//   return newCanvas;
// }

// export function drawPixelated(img,context,zoom,x,y){
//   if (!zoom) zoom=2; if (!x) x=0; if (!y) y=0;
//   if (!img.id) img.id = "__img"+(drawPixelated.lastImageId++);
//   let idata = drawPixelated.idataById[img.id];
//   if (!idata){
//     let ctx = document.createElement('canvas').getContext('2d');
//     ctx.width  = img.width;
//     ctx.height = img.height;
//     ctx.drawImage(img,0,0);
//     idata = drawPixelated.idataById[img.id] = ctx.getImageData(0,0,img.width,img.height).data;
//   }
//   for (let x2=0;x2<img.width;++x2){
//     for (let y2=0;y2<img.height;++y2){
//       let i=(y2*img.width+x2)*4;
//       let r=idata[i  ];
//       let g=idata[i+1];
//       let b=idata[i+2];
//       let a=idata[i+3];
//       context.fillStyle = "rgba("+r+","+g+","+b+","+(a/255)+")";
//       context.fillRect(x+x2*zoom, y+y2*zoom, zoom, zoom);
//     }
//   }
// };

// drawPixelated.idataById={};
// drawPixelated.lastImageId=0;