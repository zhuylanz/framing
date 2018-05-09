const express = require('express');
const app = express();
const fileUpload = require('express-fileupload');

const shell = require('shelljs');
const sizeOf = require('image-size');
const fs = require('fs');
const path = require('path');

app.use(fileUpload());
app.use(express.static(__dirname+'/public'));

app.post('/upload', (req, res, next) => {
	let file_data;
	req.files.photo ? file_data = req.files.photo.data : console.log(req.files);
	fs.writeFileSync('public/origin.png', file_data);
	res.send('ok');
});

app.get('/getframe', (req, res, next) => {
	let frame_id = req.query.frame_id;
	let frame_width = parseInt(req.query.frame_width);
	let mat_id = req.query.mat_id;
	let mat_width = parseInt(req.query.mat_width);

	let photo_path = (__dirname+'/public/origin.png');
	let photo_out_path = (__dirname+'/public/out.png');
	let photo_meta = sizeOf(photo_path);
	let photo_width = parseInt(photo_meta.width);
	let photo_height = parseInt(photo_meta.height);

	let frame_path = (__dirname+'/frame/frame'+frame_id+'.png');
	let frame_crop_path = (__dirname+'/frame/framecrop.png');
	let mat_path = (__dirname+'/mat/mat'+mat_id+'.png');
	let mat_crop_path = (__dirname+'/mat/matcrop.png');

	let cmd;

	if (!mat_id) {
		cmd = 'convert '+frame_path+' -crop '+parseInt(photo_width+10)+'x'+parseInt(frame_width+10)+'-10-10'+' '+frame_crop_path;
		cmd += ' && convert -append '+frame_crop_path+' '+photo_path+' '+frame_crop_path+' '+photo_out_path;
		cmd += ' && convert '+frame_path+' -crop '+parseInt(frame_width+10)+'x'+parseInt(photo_height+frame_width+frame_width+10)+'-10-10'+' '+frame_crop_path;
		cmd += ' && convert +append '+frame_crop_path+' '+photo_out_path+' '+frame_crop_path+' '+photo_out_path;
	} else {
		cmd = 'convert '+mat_path+' -crop '+parseInt(photo_width+10)+'x'+parseInt(mat_width+10)+'-10-10'+' '+mat_crop_path;
		cmd += ' && convert -append '+mat_crop_path+' '+photo_path+' '+mat_crop_path+' '+photo_out_path;
		cmd += ' && convert '+mat_path+' -crop '+parseInt(mat_width+10)+'x'+parseInt(photo_height+mat_width+mat_width+10)+'-10-10'+' '+mat_crop_path;
		cmd += ' && convert +append '+mat_crop_path+' '+photo_out_path+' '+mat_crop_path+' '+photo_out_path;

		cmd += ' && convert '+frame_path+' -crop '+parseInt(photo_width+mat_width+mat_width+10)+'x'+parseInt(frame_width+10)+'-10-10'+' '+frame_crop_path;
		cmd += ' && convert -append '+frame_crop_path+' '+photo_out_path+' '+frame_crop_path+' '+photo_out_path;
		cmd += ' && convert '+frame_path+' -crop '+parseInt(frame_width+10)+'x'+parseInt(photo_height+mat_width+mat_width+frame_width+frame_width+10)+'-10-10'+' '+frame_crop_path;
		cmd += ' && convert +append '+frame_crop_path+' '+photo_out_path+' '+frame_crop_path+' '+photo_out_path;
	}

	shell.exec(cmd, {silent: true}, () => {
		res.send('framing ok');
	});
});


app.listen(8005, () => console.log('Framing Server is running on Port 8005'));