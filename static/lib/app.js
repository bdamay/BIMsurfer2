/*
 * BIM Viewer
 * Copyright 2011, Bimserver.org.
 */
"use strict";

(function() {
  var bimserverImportDialogLogin, bimserverImportDialogShow, canvasCaptureThumbnail, canvasInit, constants, controlsInit, controlsPropertiesSelectObject, controlsShowProperties, controlsToggleLayer, controlsToggleTreeOpen, controlsToggleTreeVisibility, controlsTreeSelectObject, hideDialog, ifcTreeInit, keyDown, lerpLookAt, lerpLookAtNode, lookAtNodePanRelative, lookAtPanRelative, lookAtToQuaternion, modifySubAttr, mouseCoordsWithinElement, mouseDown, mouseMove, mouseUp, mouseWheel, orbitLookAt, orbitLookAtNode, recordToVec3, recordToVec4, registerControlEvents, registerDOMEvents, sceneInit, snapshotsDelete, snapshotsPlay, snapshotsPush, snapshotsToggle, state, topmenuHelp, topmenuImportBimserver, topmenuModeAdvanced, topmenuModeBasic, topmenuPerformancePerformance, topmenuPerformanceQuality, vec3ToRecord, vec4ToRecord, windowResize, zoomLookAt, zoomLookAtNode;
  var __indexOf = Array.prototype.indexOf || function(item) {
    for (var i = 0, l = this.length; i < l; i++) {
      if (this[i] === item) return i;
    }
    return -1;
  };
  RegExp.escape = function(str) {
    return str.replace(/[[\]\\$().{},?*+|^-]/g, "\\$&");
  };
  canvasCaptureThumbnail = function(srcCanvas, srcWidth, srcHeight, destWidth, destHeight) {
    var clipHeight, clipWidth, clipX, clipY, h, imgURI, thumbCanvas, thumbCtx, w;
    thumbCanvas = document.createElement('canvas');
    thumbCanvas.width = destWidth;
    thumbCanvas.height = destHeight;
    thumbCtx = thumbCanvas.getContext('2d');
    w = ($(srcCanvas)).width();
    h = ($(srcCanvas)).height();
    clipWidth = Math.min(w, srcWidth);
    clipHeight = Math.min(h, srcHeight);
    clipX = Math.floor((w - clipWidth) / 2);
    clipY = Math.floor((h - clipHeight) / 2);
    thumbCtx.drawImage(srcCanvas, clipX, clipY, clipWidth, clipHeight, 0, 0, destWidth, destHeight);
    imgURI = thumbCanvas.toDataURL('image/png');
    return imgURI;
  };
  modifySubAttr = function(node, attr, subAttr, value) {
    var attrRecord;
    attrRecord = node.get(attr);
    attrRecord[subAttr] = value;
    return node.set(attr, attrRecord);
  };
  recordToVec3 = function(record) {
    return [record.x, record.y, record.z];
  };
  recordToVec4 = function(record) {
    return [record.x, record.y, record.z, record.w];
  };
  vec3ToRecord = function(vec) {
    return {
      x: vec[0],
      y: vec[1],
      z: vec[2]
    };
  };
  vec4ToRecord = function(vec) {
    return {
      x: vec[0],
      y: vec[1],
      z: vec[2],
      w: vec[3]
    };
  };
  lookAtToQuaternion = function(lookAt) {
    var eye, look, up, x, y, z;
    eye = recordToVec3(lookAt.eye);
    look = recordToVec3(lookAt.look);
    up = recordToVec3(lookAt.up);
    x = [0.0, 0.0, 0.0];
    y = [0.0, 0.0, 0.0];
    z = [0.0, 0.0, 0.0];
    SceneJS_math_subVec3(look, eye, z);
    SceneJS_math_cross3Vec3(up, z, x);
    SceneJS_math_cross3Vec3(z, x, y);
    SceneJS_math_normalizeVec3(x);
    SceneJS_math_normalizeVec3(y);
    SceneJS_math_normalizeVec3(z);
    return SceneJS_math_newQuaternionFromMat3(x.concat(y, z));
  };
  orbitLookAt = function(dAngles, orbitUp, lookAt) {
    var axes, axesNorm, dAngle, eye0, eye1, look, result, rotAxis, rotMat, tangent1, tangentError, transformedX, transformedZ, up0, up1;
    if (dAngles[0] === 0.0 && dAngles[1] === 0.0) {
      return {
        eye: lookAt.eye,
        look: lookAt.look,
        up: lookAt.up
      };
    }
    eye0 = recordToVec3(lookAt.eye);
    up0 = recordToVec3(lookAt.up);
    look = recordToVec3(lookAt.look);
    axes = [[0.0, 0.0, 0.0], [0.0, 0.0, 0.0], [0.0, 0.0, 0.0]];
    axesNorm = [[0.0, 0.0, 0.0], [0.0, 0.0, 0.0], [0.0, 0.0, 0.0]];
    SceneJS_math_subVec3(eye0, look, axes[2]);
    SceneJS_math_cross3Vec3(up0, axes[2], axes[0]);
    SceneJS_math_normalizeVec3(axes[0], axesNorm[0]);
    SceneJS_math_normalizeVec3(axes[2], axesNorm[2]);
    SceneJS_math_cross3Vec3(axesNorm[2], axesNorm[0], axesNorm[1]);
    rotAxis = [axesNorm[0][0] * -dAngles[1] + axesNorm[1][0] * -dAngles[0], axesNorm[0][1] * -dAngles[1] + axesNorm[1][1] * -dAngles[0], axesNorm[0][2] * -dAngles[1] + axesNorm[1][2] * -dAngles[0]];
    dAngle = SceneJS_math_lenVec2(dAngles);
    rotMat = SceneJS_math_rotationMat4v(dAngle, rotAxis);
    transformedX = SceneJS_math_transformVector3(rotMat, axesNorm[0]);
    transformedZ = SceneJS_math_transformVector3(rotMat, axes[2]);
    eye1 = [0.0, 0.0, 0.0];
    SceneJS_math_addVec3(look, transformedZ, eye1);
    tangent1 = transformedX;
    tangentError = [0.0, 0.0, 0.0];
    SceneJS_math_mulVec3(tangent1, orbitUp, tangentError);
    SceneJS_math_subVec3(tangent1, tangentError);
    up1 = [0.0, 0.0, 0.0];
    SceneJS_math_cross3Vec3(transformedZ, tangent1, up1);
    return result = {
      eye: vec3ToRecord(eye1),
      look: lookAt.look,
      up: vec3ToRecord(up1)
    };
  };
  orbitLookAtNode = function(node, dAngles, orbitUp) {
    return node.set(orbitLookAt(dAngles, orbitUp, {
      eye: node.get('eye'),
      look: node.get('look'),
      up: node.get('up')
    }));
  };
  zoomLookAt = function(distance, limits, lookAt) {
    var eye0, eye0len, eye1, eye1len, look, result;
    eye0 = recordToVec3(lookAt.eye);
    look = recordToVec3(lookAt.look);
    eye0len = SceneJS_math_lenVec3(eye0);
    eye1len = Math.clamp(eye0len + distance, limits[0], limits[1]);
    eye1 = [0.0, 0.0, 0.0];
    SceneJS_math_mulVec3Scalar(eye0, eye1len / eye0len, eye1);
    return result = {
      eye: vec3ToRecord(eye1),
      look: lookAt.look,
      up: lookAt.up
    };
  };
  zoomLookAtNode = function(node, distance, limits) {
    return node.set(zoomLookAt(distance, limits, {
      eye: node.get('eye'),
      look: node.get('look'),
      up: node.get('up')
    }));
  };
  lookAtPanRelative = function(dPosition, lookAt) {
    var axes, dPositionProj, eye, look, result, up;
    if (dPosition[0] === 0.0 && dPosition[1] === 0.0) {
      return {
        eye: lookAt.eye,
        look: lookAt.look,
        up: lookAt.up
      };
    }
    eye = recordToVec3(lookAt.eye);
    look = recordToVec3(lookAt.look);
    up = recordToVec3(lookAt.up);
    axes = [[0.0, 0.0, 0.0], [0.0, 0.0, 0.0], [0.0, 0.0, 0.0]];
    SceneJS_math_subVec3(eye, look, axes[2]);
    SceneJS_math_cross3Vec3(up, axes[2], axes[0]);
    SceneJS_math_normalizeVec3(axes[0]);
    SceneJS_math_cross3Vec3(axes[2], axes[0], axes[1]);
    SceneJS_math_normalizeVec3(axes[1]);
    SceneJS_math_mulVec3Scalar(axes[0], dPosition[0]);
    SceneJS_math_mulVec3Scalar(axes[1], dPosition[1]);
    dPositionProj = [0.0, 0.0, 0.0];
    SceneJS_math_addVec3(axes[0], axes[1], dPositionProj);
    return result = {
      eye: vec3ToRecord(SceneJS_math_addVec3(eye, dPositionProj)),
      look: vec3ToRecord(SceneJS_math_addVec3(look, dPositionProj)),
      up: lookAt.up
    };
  };
  lookAtNodePanRelative = function(node, dPosition) {
    return node.set(lookAtPanRelative(dPosition, {
      eye: node.get('eye'),
      look: node.get('look'),
      up: node.get('up')
    }));
  };
  lerpLookAt = function(t, lookAt0, lookAt1) {
    var q, q0, q1, result;
    q0 = lookAtToQuaternion(lookAt0);
    q1 = lookAtToQuaternion(lookAt1);
    q = SceneJS_math_slerp(t, q0, q1);
    return result = {
      eye: SceneJS_math_lerpVec3(t, 0.0, 1.0, lookAt0.eye, lookAt1.eye),
      look: SceneJS_math_lerpVec3(t, 0.0, 1.0, lookAt0.look, lookAt1.look),
      up: vec3ToRecord(SceneJS_math_newUpVec3FromQuaternion(q))
    };
  };
  lerpLookAtNode = function(node, t, lookAt0, lookAt1) {
    return node.set(lerpLookAt(t, lookAt0, lookAt1));
  };
  SceneJS.FX = {};
  SceneJS.FX.Tween = {};
  SceneJS.FX.TweenSpline = (function() {
    var TweenSpline, _dt, _intervalID, _r, _tick, _tweens;
    TweenSpline = (function() {
      function TweenSpline(lookAtNode, play) {
        this._target = lookAtNode;
        this._sequence = [];
        this._timeline = [];
        this._play = play != null ? play : true;
        this._t = 0.0;
      }
      TweenSpline.prototype.tick = function(dt) {
        if (this._play) {
          return this._t += dt;
        }
      };
      TweenSpline.prototype.start = function(lookAt) {
        this._sequence = [
          lookAt != null ? lookAt : {
            eye: this._target.get('eye'),
            look: this._target.get('look'),
            up: this._target.get('up')
          }
        ];
        this._timeline = [0.0];
        return this._t = 0.0;
      };
      TweenSpline.prototype.push = function(lookAt, dt) {
        var dt_prime;
        if (this._sequence.length === 0) {
          this._t = 0.0;
        }
        dt_prime = dt != null ? dt : 5000;
        if (this._timeline.length === 0) {
          dt_prime = 0.0;
        }
        this._timeline.push(this.totalTime() + dt_prime);
        return this._sequence.push(lookAt);
      };
      TweenSpline.prototype.sequence = function(lookAts, dt) {
        var dt_prime, lookAt, _i, _len;
        if (this._sequence.length === 0) {
          this._t = 0.0;
        }
        for (_i = 0, _len = lookAts.length; _i < _len; _i++) {
          lookAt = lookAts[_i];
          dt_prime = dt != null ? dt : 5000;
          if (this._timeline.length === 0) {
            dt_prime = 0.0;
          }
          this._timeline.push(this.totalTime() + dt_prime);
          this._sequence.push(lookAt);
        }
        return null;
      };
      TweenSpline.prototype.pause = function() {
        return this._play = false;
      };
      TweenSpline.prototype.play = function() {
        return this._play = true;
      };
      TweenSpline.prototype.totalTime = function() {
        if (this._timeline.length > 0) {
          return this._timeline[this._timeline.length - 1];
        }
        return 0;
      };
      TweenSpline.prototype.update = function() {
        var dt, i;
        if (this._sequence.length === 0 || !this._play) {
          return;
        }
        if (this._t >= this.totalTime() || this._sequence.length === 1) {
          return this._target.set(this._sequence[this._sequence.length - 1]);
        } else {
          i = 0;
          while (this._timeline[i] <= this._t) {
            ++i;
          }
          dt = this._timeline[i] - this._timeline[i - 1];
          return lerpLookAtNode(this._target, (this._t - this._timeline[i - 1]) / dt, this._sequence[i - 1], this._sequence[i]);
        }
      };
      return TweenSpline;
    })();
    _tweens = [];
    _intervalID = null;
    _dt = 0;
    _tick = function() {
      var tween, _i, _len;
      for (_i = 0, _len = _tweens.length; _i < _len; _i++) {
        tween = _tweens[_i];
        tween.tick(_dt);
      }
      return null;
    };
    _r = function(lookAtNode, interval) {
      var tween;
      _dt = interval || 50;
      _intervalID = setInterval(_tick, _dt);
      tween = new TweenSpline(lookAtNode);
      _tweens.push(tween);
      return tween;
    };
    _r.update = function() {
      var tween, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = _tweens.length; _i < _len; _i++) {
        tween = _tweens[_i];
        _results.push(tween._t < tween.totalTime() ? tween.update() : void 0);
      }
      return _results;
    };
    return _r;
  })();
  SceneJS.FX.idle = function() {
    SceneJS.FX.TweenSpline.update();
    return null;
  };
  constants = {
    camera: {
      maxOrbitSpeed: Math.PI * 0.1,
      orbitSpeedFactor: 0.01,
      zoomSpeedFactor: 0.05,
      panSpeedFactor: 0.1
    },
    mouse: {
      pickDragThreshold: 10
    },
    canvas: {
      defaultSize: [1024, 512],
      topOffset: 122
    },
    thumbnails: {
      size: [125, 100],
      scale: 2
    },
    highlightMaterial: {
      type: 'material',
      id: 'highlight',
      emit: 0.0,
      baseColor: {
        r: 0.0,
        g: 0.5,
        b: 0.5
      }
    }
  };
  Math.clamp = function(s, min, max) {
    return Math.min(Math.max(s, min), max);
  };
  state = {
    scene: SceneJS.scene('Scene'),
    canvas: document.getElementById('scenejsCanvas'),
    settings: {
      performance: 'quality',
      mode: 'basic'
    },
    viewport: {
      domElement: document.getElementById('viewport'),
      selectedIfcObject: null,
      mouse: {
        last: [0, 0],
        leftDown: false,
        middleDown: false,
        leftDragDistance: 0,
        middleDragDistance: 0,
        pickRecord: null
      }
    },
    camera: {
      distanceLimits: [0.0, 0.0]
    },
    snapshots: {
      lookAts: []
    },
    application: {
      initialized: false
    }
  };
  mouseCoordsWithinElement = function(event) {
    var coords, element, totalOffsetLeft, totalOffsetTop;
    coords = [0, 0];
    if (!event) {
      event = window.event;
      coords = [event.x, event.y];
    } else {
      element = event.target;
      totalOffsetLeft = 0;
      totalOffsetTop = 0;
      while (element.offsetParent) {
        totalOffsetLeft += element.offsetLeft;
        totalOffsetTop += element.offsetTop;
        element = element.offsetParent;
      }
      coords = [event.pageX - totalOffsetLeft, event.pageY - totalOffsetTop];
    }
    return coords;
  };
  windowResize = function() {
    var cameraNode, cameraOptics;
    switch (state.settings.performance) {
      case 'performance':
        state.canvas.width = constants.canvas.defaultSize[0];
        state.canvas.height = constants.canvas.defaultSize[1];
        break;
      case 'quality':
        state.canvas.width = ($('#viewport')).width();
        state.canvas.height = ($('#viewport')).height();
    }
    cameraNode = state.scene.findNode('main-camera');
    cameraOptics = cameraNode.get('optics');
    cameraOptics.aspect = state.canvas.width / state.canvas.height;
    return cameraNode.set('optics', cameraOptics);
  };
  mouseDown = function(event) {
    var coords;
    state.viewport.mouse.last = [event.clientX, event.clientY];
    switch (event.which) {
      case 1:
        state.viewport.mouse.leftDown = true;
        break;
      case 2:
        state.viewport.mouse.middleDown = true;
    }
    if (event.which === 1) {
      coords = mouseCoordsWithinElement(event);
      return state.viewport.mouse.pickRecord = state.scene.pick(coords[0], coords[1]);
    }
  };
  mouseUp = function(event) {
    if (event.which === 1 && state.viewport.mouse.leftDragDistance < constants.mouse.pickDragThreshold) {
      if (state.viewport.mouse.pickRecord != null) {
        controlsTreeSelectObject(state.viewport.mouse.pickRecord.nodeId);
      } else {
        controlsTreeSelectObject();
      }
      state.viewport.mouse.pickRecord = null;
    }
    switch (event.which) {
      case 1:
        state.viewport.mouse.leftDown = false;
        return state.viewport.mouse.leftDragDistance = 0;
      case 2:
        state.viewport.mouse.middleDown = false;
        return state.viewport.mouse.middleDragDistance = 0;
    }
  };
  mouseMove = function(event) {
    var delta, deltaLength, orbitAngles, panVector;
    delta = [event.clientX - state.viewport.mouse.last[0], event.clientY - state.viewport.mouse.last[1]];
    deltaLength = SceneJS_math_lenVec2(delta);
    if (state.viewport.mouse.leftDown) {
      state.viewport.mouse.leftDragDistance += deltaLength;
    }
    if (state.viewport.mouse.middleDown) {
      state.viewport.mouse.middleDragDistance += deltaLength;
    }
    if (state.viewport.mouse.leftDown) {
      orbitAngles = [0.0, 0.0];
      SceneJS_math_mulVec2Scalar(delta, constants.camera.orbitSpeedFactor / deltaLength, orbitAngles);
      orbitAngles = [Math.clamp(orbitAngles[0], -constants.camera.maxOrbitSpeed, constants.camera.maxOrbitSpeed), Math.clamp(orbitAngles[1], -constants.camera.maxOrbitSpeed, constants.camera.maxOrbitSpeed)];
      orbitLookAtNode(state.scene.findNode('main-lookAt'), orbitAngles, [0.0, 0.0, 1.0]);
    } else if (state.viewport.mouse.middleDown) {
      panVector = [0.0, 0.0];
      SceneJS_math_mulVec2Scalar([-delta[0], delta[1]], constants.camera.panSpeedFactor / deltaLength, panVector);
      lookAtNodePanRelative(state.scene.findNode('main-lookAt'), panVector);
    }
    return state.viewport.mouse.last = [event.clientX, event.clientY];
  };
  mouseWheel = function(event) {
    var delta, zoomDistance;
    delta = event.wheelDelta != null ? event.wheelDelta / -120.0 : Math.clamp(event.detail, -1.0, 1.0);
    zoomDistance = delta * state.camera.distanceLimits[1] * constants.camera.zoomSpeedFactor;
    return zoomLookAtNode(state.scene.findNode('main-lookAt'), zoomDistance, state.camera.distanceLimits);
  };
  keyDown = function(event) {
    switch (event.which) {
      case 72:
        return topmenuHelp();
    }
  };
  topmenuImportBimserver = function(event) {
    return bimserverImportDialogShow();
  };
  topmenuPerformanceQuality = function(event) {
    ($(event.target)).addClass('top-menu-activated');
    ($('#top-menu-performance-performance')).removeClass('top-menu-activated');
    ($('#viewport')).removeClass('viewport-performance');
    state.settings.performance = 'quality';
    return windowResize();
  };
  topmenuPerformancePerformance = function(event) {
    ($(event.target)).addClass('top-menu-activated');
    ($('#top-menu-performance-quality')).removeClass('top-menu-activated');
    ($('#viewport')).addClass('viewport-performance');
    state.settings.performance = 'performance';
    return windowResize();
  };
  topmenuModeBasic = function(event) {
    ($(event.target)).addClass('top-menu-activated');
    ($('#top-menu-mode-advanced')).removeClass('top-menu-activated');
    return state.settings.mode = 'basic';
  };
  topmenuModeAdvanced = function(event) {
    ($(event.target)).addClass('top-menu-activated');
    ($('#top-menu-mode-basic')).removeClass('top-menu-activated');
    return state.settings.mode = 'performance';
  };
  topmenuHelp = function() {
    ($('#top-menu-help')).toggleClass('top-menu-activated');
    ($('#main-view-help')).toggle();
    return ($('#main-view-keys')).toggle();
  };
  controlsPropertiesSelectObject = function(id) {
    var html, key, objectProperties, properties, tableItem, value;
    properties = state.scene.data().properties;
    if (!(id != null)) {
      return ($('#controls-properties')).html("<p class='controls-message'>Select an object to see its properties.</p>");
    }
    if (!(properties != null)) {
      return ($('#controls-properties')).html("<p class='controls-message'>No properties could be found in the scene.</p>");
    }
    objectProperties = properties[id];
    tableItem = function(key, value) {
      var html;
      html = "<li class='controls-table-item'>";
      html += "<label class='controls-table-label'>" + key + "</label>";
      html += "<div class='controls-table-value'>" + value + "</div>";
      return html += "</li>";
    };
    html = "<ul class='controls-table'>";
    html += tableItem('Global Id', id);
    if (objectProperties != null) {
      for (key in objectProperties) {
        value = objectProperties[key];
        html += tableItem(key, value);
      }
    }
    html += "</ul>";
    if (!objectProperties) {
      html += "<p class='controls-message'>No additional properties could be found for the object with id '" + id + "'.</p>";
    }
    return ($('#controls-properties')).html(html);
  };
  controlsToggleTreeOpen = function(event) {
    var $parent, id;
    $parent = ($(event.target)).parent();
    id = $parent.attr('id');
    $parent.toggleClass('controls-tree-open');
    controlsTreeSelectObject(id);
    return controlsPropertiesSelectObject(id);
  };
  controlsToggleTreeVisibility = function(event) {
    var $parent, collectNodes, disableNode, disableTagJson, disabledNodes, ids, node, parentId, parentNode, tag, tagNode, _i, _j, _k, _len, _len2, _len3, _ref, _ref2;
    $parent = ($(event.target)).closest('.controls-tree-rel');
    parentId = $parent.attr('id');
    ids = [parentId];
    if (event.target.checked) {
      disabledNodes = state.scene.findNodes('^disable-.*?-' + (RegExp.escape(parentId)) + '$');
      for (_i = 0, _len = disabledNodes.length; _i < _len; _i++) {
        node = disabledNodes[_i];
        node.splice();
      }
      return;
    }
    ($parent.find('.controls-tree-rel')).each(function() {
      return ids.push(this.id);
    });
    _ref = state.scene.data().ifcTypes;
    for (_j = 0, _len2 = _ref.length; _j < _len2; _j++) {
      tag = _ref[_j];
      tag = tag.toLowerCase();
      tagNode = state.scene.findNode(tag);
      disableTagJson = {
        type: 'tag',
        tag: 'disable',
        id: 'disable-' + tag + '-' + parentId
      };
      if (tagNode != null) {
        collectNodes = [];
        tagNode.eachNode((function() {
          var _ref2;
          if ((this.get('type')) === 'name' && (_ref2 = this.get('id'), __indexOf.call(ids, _ref2) >= 0) && (this.parent().get('id')) !== disableTagJson.id) {
            collectNodes.push(this);
          }
          return false;
        }), {
          depthFirst: true
        });
        for (_k = 0, _len3 = collectNodes.length; _k < _len3; _k++) {
          node = collectNodes[_k];
          parentNode = node.parent();
          disableNode = (_ref2 = parentNode.node(disableTagJson.id)) != null ? _ref2 : (parentNode.add('node', disableTagJson)).node(disableTagJson.id);
          disableNode.add('node', node.disconnect());
        }
      }
    }
    return false;
  };
  controlsTreeSelectObject = function(id) {
    var $treeItem, node, oldHighlight, parentEl;
    ($('.controls-tree-selected')).removeClass('controls-tree-selected');
    ($('.controls-tree-selected-parent')).removeClass('controls-tree-selected-parent');
    oldHighlight = state.scene.findNode(constants.highlightMaterial.id);
    if (oldHighlight != null) {
      oldHighlight.splice();
    }
    if (id != null) {
      parentEl = document.getElementById(id);
      $treeItem = ($(parentEl)).children('.controls-tree-item');
      $treeItem.addClass('controls-tree-selected');
      ($('.controls-tree:has(.controls-tree-selected)')).addClass('controls-tree-selected-parent');
      controlsPropertiesSelectObject(id);
      node = state.scene.findNode(id);
      if (node != null) {
        return node.insert('node', constants.highlightMaterial);
      }
    }
  };
  controlsShowProperties = function(event) {
    if ((event != null) && event.target.nodeName === 'INPUT') {
      return;
    }
    return ($('#controls-accordion')).accordion('activate', 1);
  };
  controlsToggleLayer = function(event) {
    var el, elements, tags;
    elements = ($('#controls-layers input:checked')).toArray();
    tags = (function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = elements.length; _i < _len; _i++) {
        el = elements[_i];
        _results.push(((($(el)).attr('id')).split(/^layer\-/))[1]);
      }
      return _results;
    })();
    return state.scene.set('tagMask', '^(' + (tags.join('|')) + ')$');
  };
  snapshotsPush = function() {
    var imgURI, node, thumbSize;
    if ($.browser.webkit) {
      state.scene.renderFrame({
        force: true
      });
    }
    thumbSize = constants.thumbnails.size;
    imgURI = canvasCaptureThumbnail(state.canvas, 512 * thumbSize[0] / thumbSize[1], 512, constants.thumbnails.scale * thumbSize[0], constants.thumbnails.scale * thumbSize[1]);
    node = state.scene.findNode('main-lookAt');
    state.snapshots.lookAts.push({
      eye: node.get('eye'),
      look: node.get('look'),
      up: node.get('up')
    });
    return ($('#snapshots')).append("<div class='snapshot'><div class='snapshot-thumb'><a href='#' class='snapshot-delete'>x</a><img width='" + thumbSize[0] + "px' height='" + thumbSize[1] + "px' src='" + imgURI + "'></div></div>");
  };
  snapshotsDelete = function(event) {
    var $parent;
    $parent = ($(event.target)).parent();
    state.snapshots.lookAts.slice($parent.index() + 1);
    return $parent.remove();
  };
  snapshotsToggle = function(event) {};
  snapshotsPlay = function(event) {
    return (SceneJS.FX.TweenSpline(state.scene.findNode('main-lookAt'))).sequence(state.snapshots.lookAts);
  };
  hideDialog = function() {
    return ($('#dialog-background')).hide();
  };
  bimserverImportDialogShow = function() {
    return ($('#dialog-background')).show();
  };
  bimserverImportDialogLogin = function() {
    var pwd, url, user;
    url = ($('#bimserver-import-url')).val();
    user = ($('#bimserver-import-username')).val();
    pwd = ($('#bimserver-import-password')).val();
    if (url.length < 1) {
      return false;
    }
    if (user.length < 1) {
      return false;
    }
    if (pwd.length < 1) {
      return false;
    }
    if (url[url.length - 1] !== '/') {
      url += '/';
    }
    ($.get(url + 'rest/login', 'username=' + (encodeURIComponent(user)) + '&password=' + (encodeURIComponent(pwd)))).done(function(data, textStatus, jqXHR) {
      return console.log('Login request succeeded');
    }).fail(function(jqXHR, textStatus, errorThrown) {
      return console.log('Login request failed');
    }).always(function(jqXHR, textStatus, errorThrown) {
      return console.log('Login request completed');
    });
    pwd = null;
    return true;
  };
  registerDOMEvents = function() {
    state.viewport.domElement.addEventListener('mousedown', mouseDown, true);
    state.viewport.domElement.addEventListener('mouseup', mouseUp, true);
    state.viewport.domElement.addEventListener('mousemove', mouseMove, true);
    state.viewport.domElement.addEventListener('mousewheel', mouseWheel, true);
    state.viewport.domElement.addEventListener('DOMMouseScroll', mouseWheel, true);
    document.addEventListener('keydown', keyDown, true);
    return window.addEventListener('resize', windowResize, true);
  };
  registerControlEvents = function() {
    ($('.dialog-close')).click(hideDialog);
    ($('#bimserver-import-login')).click(bimserverImportDialogLogin);
    ($('#top-menu-import-bimserver')).click(topmenuImportBimserver);
    ($('#top-menu-performance-quality')).click(topmenuPerformanceQuality);
    ($('#top-menu-performance-performance')).click(topmenuPerformancePerformance);
    ($('#top-menu-mode-basic')).click(topmenuModeBasic);
    ($('#top-menu-mode-advanced')).click(topmenuModeAdvanced);
    ($('#top-menu-help')).click(topmenuHelp);
    ($('#controls-relationships')).delegate('.controls-tree-item', 'click', controlsToggleTreeOpen);
    ($('#controls-relationships')).delegate('.controls-tree-item', 'dblclick', controlsShowProperties);
    ($('#controls-relationships')).delegate('input', 'change', controlsToggleTreeVisibility);
    ($('#controls-layers input')).change(controlsToggleLayer);
    ($('#snapshot-placeholder')).click(snapshotsPush);
    ($('#snapshots')).delegate('.snapshot', 'click', snapshotsToggle);
    ($('#snapshots')).delegate('.snapshot-delete', 'click', snapshotsDelete);
    ($('#snapshots-play')).click(snapshotsPlay);
    return ($(state.viewport.domElement)).dblclick(controlsShowProperties);
  };
  canvasInit = function() {
    return windowResize();
  };
  sceneInit = function() {
    var sceneDiameter, tag, tags;
    modifySubAttr(state.scene.findNode('main-camera'), 'optics', 'aspect', state.canvas.width / state.canvas.height);
    sceneDiameter = SceneJS_math_lenVec3(state.scene.data().bounds);
    state.camera.distanceLimits = [sceneDiameter * 0.1, sceneDiameter * 2.0];
    tags = (function() {
      var _i, _len, _ref, _results;
      _ref = state.scene.data().ifcTypes;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        tag = _ref[_i];
        _results.push(tag.toLowerCase());
      }
      return _results;
    })();
    return state.scene.set('tagMask', '^(' + (tags.join('|')) + ')$');
  };
  controlsInit = function() {
    var ifcType, layersHtml, sceneData;
    sceneData = state.scene.data();
    layersHtml = (function() {
      var _i, _len, _ref, _results;
      _ref = sceneData.ifcTypes;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        ifcType = _ref[_i];
        _results.push("<div><input id='layer-" + ifcType.toLowerCase() + "' type='checkbox' checked='checked'> " + ifcType + "</div>");
      }
      return _results;
    })();
    ($('#controls-layers')).html(layersHtml.join(''));
    controlsPropertiesSelectObject();
    ($('#controls-accordion')).accordion({
      header: 'h3'
    });
    return ($('#main-view-controls')).removeAttr('style');
  };
  ifcTreeInit = function() {
    var ifcContains, ifcDecomposedBy, ifcDefinedBy, ifcObjectDescription, ifcProject, ifcRelationships, project, sceneData, treeHtml, _i, _len, _ref;
    sceneData = state.scene.data();
    ifcObjectDescription = function(obj, indent) {
      return "<li class='controls-tree-rel' id='" + obj.id + "'><div class='controls-tree-item'><span class='indent-" + String(indent) + "'/>" + "<input type='checkbox' checked='checked'> " + obj.name + "<span class='controls-tree-postfix'>(" + obj.type + ")</span></div>" + (ifcDefinedBy(obj.decomposedBy, indent)) + (ifcDefinedBy(obj.definedBy, indent)) + (ifcContains(obj.contains, indent)) + "</li>";
    };
    ifcProject = function(obj) {
      return "<li class='controls-tree-root' id='" + obj.id + "'><div class='controls-tree-item'>" + obj.name + "<span class='controls-tree-postfix'>(" + obj.type + ")</span></div>" + (ifcDefinedBy(obj.decomposedBy, 0)) + (ifcDefinedBy(obj.definedBy, 0)) + (ifcContains(obj.contains, 0)) + "</li>";
    };
    ifcRelationships = function(type, rel, indent) {
      var html, obj, _i, _len;
      if ((rel != null) && rel.length > 0) {
        indent = Math.min(indent + 1, 6);
        html = "<ul class='controls-tree'>";
        html += "<div class='controls-tree-heading'><hr><h4>" + type + "</h4></div>";
        for (_i = 0, _len = rel.length; _i < _len; _i++) {
          obj = rel[_i];
          html += ifcObjectDescription(obj, indent);
        }
        return html += "</ul>";
      } else {
        return "";
      }
    };
    ifcDecomposedBy = function(rel, indent) {
      return ifcRelationships('Decomposed By', rel, indent);
    };
    ifcDefinedBy = function(rel, indent) {
      return ifcRelationships('Defined By', rel, indent);
    };
    ifcContains = function(rel, indent) {
      return ifcRelationships('Contains', rel, indent);
    };
    treeHtml = "<ul class='controls-tree'>";
    _ref = sceneData.relationships;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      project = _ref[_i];
      treeHtml += ifcProject(project);
    }
    treeHtml += "</ul>";
    return ($('#controls-relationships')).html(treeHtml);
  };
  canvasInit();
  sceneInit();
  state.scene.start({
    idleFunc: SceneJS.FX.idle
  });
  $(function() {
    controlsInit();
    registerDOMEvents();
    registerControlEvents();
    ifcTreeInit();
    return state.application.initialized = true;
  });
}).call(this);
