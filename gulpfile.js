const fs = require('fs');
const path = require('path');
const gulp = require('gulp');
const gulpSequence = require('gulp-sequence');
const hercule = require('hercule');
const drafter = require('drafter.js');


const entrypoint = path.join(__dirname, 'api.apib');
const endpoint = path.join(__dirname, 'apiary.apib');

gulp.task('transclude', async function() {
  try {
    fs.accessSync(entrypoint, fs.F_OK | fs.R_OK);
  } catch (e) {
    console.warn('no entrypoint found, not processing anything.');
    process.exit(1);
  }

  return await hercule.transcludeFile(entrypoint, function(err, output) {
    fs.writeFileSync(endpoint, output);
  })
});

gulp.task('syntax:check', function() {
  try {
    fs.accessSync(endpoint, fs.F_OK | fs.R_OK);
  } catch (e) {
    console.warn('no endpoint found, not processing anything.');
    process.exit(1);
  }

  const options = {
    requireBlueprintName: true,
    generateSourceMap: true
  };

  const res = drafter.validate('# API Blueprint...', options, function (err, res) {
    if (err) {
        console.log(err)
    }

    if (res) {
        console.log("Document has semantic issues!");
        console.log(res);
        exit(1);
    } else {
        console.log("Document is valid with no warnings.");
    }
  });
});

gulp.task('watch', function() {
  gulp.watch(['**/*.apib', '!apiary.apib'], gulpSequence(['transclude', 'syntax:check']));
});

gulp.task('default', gulpSequence(['transclude', 'syntax:check']));

