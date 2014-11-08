
// The top level variable `files` has been created and populated in
// `default.html`


'use strict';

var SPACE_KEY = 32,
    PREV_KEY = 37,
    NEXT_KEY = 39;

/**
 * The class definition for the gallery
 */
var Gallery = function() {

  this.linksContainer = document.querySelector('header nav .gallery-links');

  this.mainElement = document.querySelector('#main');

  // The actual list of all available galleries
  this.galleries = {};


  var self = this;

  // Making sure the files are always in the same order
  files.sort(function(a, b) {
    if (a > b) {
      return 1;
    }
    if (a < b) {
      return -1;
    }
    // a must be equal to b
    return 0;
  });

  // Now going through all files and putting them in proper lists.
  files.forEach(function(file) {

    // Removing leading `/` before splitting into different parts
    var fileParts = file.replace(/^\//, '').split('/');

    if (fileParts[0] === 'gallery' && fileParts.length === 3) {
      var galleryName = fileParts[1];
      if (!self.galleries[galleryName]) self.galleries[galleryName] = {files: []};
      self.galleries[galleryName].files.push(fileParts[2]);
    }
    else {
      console.log('Not using file: ' + file);
    }
  });

  this.addMenuLinks();

  window.onpopstate = function(event) {
    if (event.state.galleryName && event.state.imageName) {
      self.showImage(event.state.galleryName, event.state.imageName, true);
    }
    else if (event.state.galleryName) {
      self.showGallery(event.state.galleryName, true);
    }
  }

  if (window.location.hash.indexOf('#/gallery/') === 0) {
    var parts = window.location.hash.split('/');
    if (parts.length === 3) {
      this.showGallery(parts[2]);
    }
    else if (parts.length === 4) {
      this.showImage(parts[2], parts[3]);
    }
  }

  window.addEventListener('keyup', function(evt) {
    if (evt.keyCode === PREV_KEY) {
      self.showPrevImage();
    }
    else if (evt.keyCode === NEXT_KEY || evt.keyCode == SPACE_KEY) {
      self.showNextImage();
    }
  });

};

/**
 * Adds the links for the different galleries to the main menu
 */
Gallery.prototype.addMenuLinks = function() {
  var self = this;

  for (var galleryName in this.galleries) {
    // Creating closure
    !function(galleryName) {
      var link = document.createElement('a');
      link.href = 'javascript:undefined';
      link.textContent = galleryName
      link.addEventListener('click', function() { self.showGallery(galleryName); });
      self.linksContainer.appendChild(link);
    }(galleryName);
  }
}

/**
 * Adds the links for the different galleries to the main menu
 */
Gallery.prototype.showGallery = function(galleryName, noHistoryPush) {
  var self = this;

  this.currentGalleryName = null;
  this.currentImageName = null;

  if (!noHistoryPush) {
    window.history.pushState({galleryName: galleryName}, galleryName, '/#/gallery/' + galleryName);
  }

  this.mainElement.innerHTML = '';

  var galleryGrid = document.createElement('div');
  galleryGrid.className = 'gallery-grid';

  this.galleries[galleryName].files.forEach(function(file) {
    var imgContainer = document.createElement('div');
    imgContainer.className = 'img-container';
    imgContainer.style.backgroundImage = 'url(' + encodeURIComponent(self.getFileName(galleryName, file)) + ')';
    // var img = document.createElement('img');
    // img.src = self.getFileName(galleryName, file);
    // imgContainer.appendChild(img);
    imgContainer.addEventListener('click', function() { self.showImage(galleryName, file); });
    galleryGrid.appendChild(imgContainer);
  });

  this.mainElement.appendChild(galleryGrid);

}

/**
 * Returns the full path for provided gallery and image
 */
Gallery.prototype.getFileName = function(galleryName, imageName) {
  return '/gallery/' + galleryName + '/' + imageName;
}

/**
 * Shows image of gallery with given index.
 *
 * This function assumes that galleryName and imageName are valid properties!
 */
Gallery.prototype.showImage = function(galleryName, imageName, noHistoryPush) {
  var self = this;

  if (!noHistoryPush) {
    window.history.pushState({galleryName: galleryName, imageName: imageName}, galleryName + ' - ' + imageName, '/#/gallery/' + galleryName + '/' + imageName);  
  }

  this.currentGalleryName = galleryName;
  this.currentImageName = imageName;

  this.mainElement.innerHTML = '';

  var container = document.createElement('div');
  container.className = 'big-image';

  var img = document.createElement('img');
  img.src = this.getFileName(galleryName, imageName);

  img.addEventListener('click', function() {
    self.showNextImage();
  });

  container.appendChild(img);

  this.mainElement.appendChild(container);

  this.paintPagination();

}


/**
 * Returns the index of given imageName
 */
Gallery.prototype.getImageIdx = function(galleryName, imageName) {
  for (var i = 0; i < this.galleries[galleryName].files.length; i++) {
    if (this.galleries[galleryName].files[i] == imageName) return i;
  }
}


/**
 * Returns true if given image has a next image
 */
Gallery.prototype.hasNextImage = function(galleryName, imageName) {
  return this.galleries[galleryName].files.length > this.getImageIdx(galleryName, imageName) + 1;
}
/**
 * Returns true if given image has a prev image
 */
Gallery.prototype.hasPrevImage = function(galleryName, imageName) {
  return this.getImageIdx(galleryName, imageName) > 0;
}

Gallery.prototype.showNextImage = function() {

  if (this.currentGalleryName === null || this.currentImageName === null || !this.hasNextImage(this.currentGalleryName, this.currentImageName)) {
    return;
  }

  this.showImage(this.currentGalleryName, this.galleries[this.currentGalleryName].files[this.getImageIdx(this.currentGalleryName, this.currentImageName) + 1]);
}

Gallery.prototype.showPrevImage = function() {

  if (this.currentGalleryName === null || this.currentImageName === null || !this.hasPrevImage(this.currentGalleryName, this.currentImageName)) {
    return;
  }

  this.showImage(this.currentGalleryName, this.galleries[this.currentGalleryName].files[this.getImageIdx(this.currentGalleryName, this.currentImageName) - 1]);
}


Gallery.prototype.paintPagination = function() {
  if (this.currentGalleryName === null || this.currentImageName === null) return;

  var self = this;
  var currentImageIdx = this.getImageIdx(this.currentGalleryName, this.currentImageName);

  var nav = document.createElement('nav');
  nav.className = 'pagination';

  var prev = document.createElement('a');
  prev.innerHTML = '&lt;&lt;';
  prev.className = 'prev';
  prev.href = 'javascript:none;';
  prev.addEventListener('click', function() { self.showPrevImage(); });
  nav.appendChild(prev);

  for (var i = 0; i < this.galleries[this.currentGalleryName].files.length; i++) {
    !function(i) {
      var page = document.createElement('a');
      page.href = 'javascript:undefined';
      page.innerHTML = i + 1;
      page.addEventListener('click', function() { self.showImage(self.currentGalleryName, self.galleries[self.currentGalleryName].files[i]); });
      if (i == currentImageIdx) page.className = 'active';
      nav.appendChild(page);
    }(i);
  }

  var next = document.createElement('a');
  next.className = 'next';
  next.innerHTML = '&gt;&gt;';
  next.href = 'javascript:none;';
  next.addEventListener('click', function() { self.showNextImage(); });
  nav.appendChild(next);


  this.mainElement.appendChild(nav);
}


var gallery = new Gallery();

