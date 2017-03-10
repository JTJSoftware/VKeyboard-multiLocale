// *** Copyright (c)2002, 2010 Jim Massey. All rights reserved  ***********
// *** massey@stlouis-shopper.com **************
// *** No Warranty - certified to work with nothing ***
// *** developed to work with mozilla kiosk **** 

var vkeyboard = new Object;

vkeyboard.clickItem = "";
vkeyboard.current_VK_focus = "";
vkeyboard.VK_focus_value = "";
vkeyboard.consoleService = Components.classes["@mozilla.org/consoleservice;1"]
                                 .getService(Components.interfaces.nsIConsoleService);


// *** Get the currently focused item and see if/how we can use it *****
vkeyboard.item_got_focus = function() {

    //just a demo of using nsIFocusManager. 
    //FocusManager seems to just report on xul items only - not items in the html document
    /*
    var testFocus = Components.classes["@mozilla.org/focus-manager;1"].getService(Components.interfaces.nsIFocusManager);
    if (testFocus.focusedElement.getAttribute("anonid") == "input") consoleService.logStringMessage("FocusManager reports focus is: " + testFocus.focusedElement.getAttribute("anonid")); 
    */

    //var j = 0;
	var current_focus = document.commandDispatcher.focusedElement;
	
        if (current_focus == null) {
           vkeyboard.current_VK_focus = null;
           vkeyboard.VK_focus_value = "";
           return;
        }
	
        var focusedItem = current_focus.parentNode.parentNode.parentNode.getAttribute('id');

	// Just a demo of using document.activeElement
	// activeElement - just seems to report only xul
	/*
        var content_focus = document.activeElement;
        consoleService.logStringMessage("FOCUSED item and activeElement: " + current_focus + " :: " + document.activeElement.getAttribute("id"));
	*/

	//popup the vkboardURIBar if urlbar is focused
        if (focusedItem == "urlbar"){
	    vkeyboard.vKeyBoardURIBar(focusedItem);
	}

	if ( current_focus == "[object XULElement]" ) { return }

        vkeyboard.consoleService.logStringMessage("FOCUSED1: " + current_focus +"\n");
        if (current_focus == null 
	     || current_focus.type != "text" 
	        || current_focus.type != "textarea"  ) {
           vkeyboard.current_VK_focus = null;
           vkeyboard.VK_focus_value = "";
        }

    // *** Test for various input types we can use **
try {
    vkeyboard.consoleService.logStringMessage("FOCUSED2: " + current_focus.type +"\n");
	var focus_value = current_focus.value;
	if (current_focus.type == "text" 
	     || current_focus.type == "textarea" 
                || current_focus.type == "password") {
	  vkeyboard.VK_focus_value = focus_value;
	  vkeyboard.current_VK_focus = current_focus;
	}

} catch (e) {
    //  dump("FOCUSED2 fail because: " + e);
    vkeyboard.consoleService.logStringMessage("FOCUSED2 fail because: " + e);
}


}

vkeyboard.item_got_focusB = function() {
	var j = 0;
	var current_focus = document.commandDispatcher.focusedElement;

}

// *** I can't find a good use for this but it is interesting ****
vkeyboard.VK_advance_focus = function() {
        document.commandDispatcher.rewindFocus();
	vkeyboard.current_VK_focus = document.commandDispatcher.focusedElement;
	vkeyboard.VK_focus_value = document.commandDispatcher.focusedElement;
	dump("### REWIND FOCUS: " + document.commandDispatcher.focusedElement + " ***\n");
vkeyboard.consoleService.logStringMessage("### REWIND FOCUS: " + document.commandDispatcher.focusedElement + " ***\n");
}

// **** Handle Vkeystrokes from normal VKeys ****
vkeyboard.VKhandlefocus = function(VKvalue) {
try {
  vkeyboard.current_VK_focus.focus();
  var selStart = vkeyboard.current_VK_focus.selectionStart;
  var selEnd = vkeyboard.current_VK_focus.selectionEnd;
  var stringBegining = vkeyboard.current_VK_focus.value.substring(0, selStart);
  var stringEnd = vkeyboard.current_VK_focus.value.substring(selEnd, vkeyboard.VK_focus_value.length);
  var thisSelection = window.content.getSelection();

  vkeyboard.consoleService.logStringMessage("Current Selection: " + selStart + " : " + selEnd +  " : " + vkeyboard.current_VK_focus.value.substring(selEnd) + " :: " + vkeyboard.current_VK_focus.value + " :: " + vkeyboard.current_VK_focus.length);

 // if Enter key was pressed process it and get out of here
 if(VKvalue == "ENTER") {
      vkeyboard.VKEnter();
      return;
 }

  // If we have a btnCapslock check if things should be uppercase
  if (document.getElementById("urn:VKBoard:btnCapslock")) {
     var capsBtn = document.getElementById("urn:VKBoard:btnCapslock");
     var ontxt = capsBtn.getAttribute("ontxt");
     //vkeyboard.consoleService.logStringMessage("**** Capslock ITEM GOT FOCUS: " + ontxt + " **");
     if(capsBtn.getAttribute("label") == ontxt) {
	   VKvalue = VKvalue.toUpperCase();
     }
  }
        vkeyboard.current_VK_focus.value = stringBegining + VKvalue + stringEnd;
        vkeyboard.VK_focus_value = stringBegining + VKvalue + stringEnd;
} catch (e) {
       if (vkeyboard.current_VK_focus_value == null) return;
      vkeyboard.consoleService.logStringMessage("VKHandle Focus FAILED : " + e);
       vkeyboard.current_VK_focus.value = stringBegining + VKvalue + stringEnd;
       vkeyboard.VK_focus_value = stringBegining + VKvalue + stringEnd;
}

     // will cause textarea end to be visible - keeps caret visible
      var pressKey = document.createEvent("KeyboardEvent");
      pressKey.initKeyEvent("keypress", true, true, null, 
	                   false, false, false, false,
			    35, 0);
      var dispatchPressKey = vkeyboard.current_VK_focus.dispatchEvent(pressKey);

      // set focus and insertion point
     try {
        vkeyboard.current_VK_focus.focus();
        vkeyboard.current_VK_focus.setSelectionRange(selStart+1, selEnd+1);
     } catch (e) {
         //must not have had anything focused. Just do nothing
     }

}

vkeyboard.VKEnter = function() {
  try{
      //current_VK_focus.parentNode.submit();

      // generate an Enter keypress
      var enterKey = document.createEvent("KeyboardEvent");
      enterKey.initKeyEvent("keypress", true, true, null, 
	                   false, false, false, false,
			   13, 0);
      var dispatchReturn = vkeyboard.current_VK_focus.dispatchEvent(enterKey);

      vkeyboard.current_VK_focus.focus();

      // report success(true) or failure(false) of generated keypress
      //vkeyboard.consoleService.logStringMessage("VKEnter returned: " + dispatchReturn);
  } catch (e) {
      vkeyboard.consoleService.logStringMessage("*** VKEnter failed because: " + e + "\n" );
      vkeyboard.isUriBar();
 }
}

// **** Delete entire contents of focused field ****
vkeyboard.VKhandledelete = function() {

      var delKey = document.createEvent("KeyboardEvent");
      delKey.initKeyEvent("keypress", true, true, null, 
	                   false, false, false, false,
			   46, 0);
      var dispatchReturn = vkeyboard.current_VK_focus.dispatchEvent(delKey);
      vkeyboard.current_VK_focus.focus();
      return;	
}

// Delete entire contents of focused field
vkeyboard.VKClearField = function() {
	vkeyboard.current_VK_focus.value = "";
	vkeyboard.VK_focus_value = "";
}

// **** Delete the Last char from focused field ****
vkeyboard.VKbackspace = function() {
      var backspaceKey = document.createEvent("KeyboardEvent");
      backspaceKey.initKeyEvent("keypress", true, true, null, 
	                   false, false, false, false,
			   8, 0);
      var dispatchReturn = vkeyboard.current_VK_focus.dispatchEvent(backspaceKey);

      vkeyboard.current_VK_focus.focus();
      return;
}

// **** Toggles the capslock flag - label - for cap letters
vkeyboard.capslock = function() {
    try{
	
	var temp = document.getElementById("urn:VKBoard:btnCapslock");
        var ontxt = temp.getAttribute("ontxt");
        var offtxt = temp.getAttribute("offtxt");
	//var temp = document.getElementById("VK_shift");
 	if (temp.getAttribute("label") == offtxt) {
		 temp.setAttribute("label", ontxt);
	} else {
		 temp.setAttribute("label", offtxt);
	}

    } catch (e) {
	vkeyboard.consoleService.logStringMessage("capslock FAILED because: " + e);
    }

}

// **** Collapse the VKboard ****
vkeyboard.collapse_VKboard = function() {
	vkeyboard.listKeyboards();
      	var temp = document.getElementById('VKboard_box');
      	var tempB = document.getElementById('VKboard1');
	var tempC = document.getElementById('VKnumpad');
	var tempD = document.getElementById('VKspecialpad');
	if (tempB.getAttribute("moz-collapsed") != "true" ||
		tempB.getAttribute("collapsed") != "true") {
      	     temp.collapseToolbar(tempB);
	     tempB.setAttribute("collapsed", "true");
	}
	tempC.setAttribute("moz-collapsed", "false");
	tempC.setAttribute("collapsed", "false");
	tempD.setAttribute("moz-collapsed", "true");
	tempD.setAttribute("collapsed", "true");
        document.getElementById("vkboardURIBar").setAttribute("style", "display: none;");

}

// *** Toggles the special keypads ***
vkeyboard.VKtoggle_pad = function() {

    try{
	var temp = document.getElementById('VKboard_box');
	var tempC = document.getElementById('VKnumpad');
	var tempD = document.getElementById('VKspecialpad');
        var tempE = document.getElementById('VKTextNavpad');
	//vkeyboard.consoleService.logStringMessage("** Special pad up status : " + tempD.getAttribute("collapsed") );

	if (tempE.getAttribute("moz-collapsed") == "false" ) {
	    tempD.setAttribute("moz-collapsed", "true");
		tempD.setAttribute("collapsed", "true");
	    tempE.setAttribute("moz-collapsed", "true");
		tempE.setAttribute("collapsed", "true");
	    tempC.setAttribute("moz-collapsed", "false");
		tempC.setAttribute("collapsed", "false");
	} else if (tempD.getAttribute("collapsed") == "false" ){
	    tempC.setAttribute("moz-collapsed", "true");
		tempC.setAttribute("collapsed", "true");
	    tempD.setAttribute("moz-collapsed", "true");
		tempD.setAttribute("collapsed", "true");
	    tempE.setAttribute("moz-collapsed", "false");
		tempE.setAttribute("collapsed", "false");
	} else {
	    tempC.setAttribute("moz-collapsed", "true");
		tempC.setAttribute("collapsed", "true");
	    tempD.setAttribute("moz-collapsed", "false");
		tempD.setAttribute("collapsed", "false");
	    tempE.setAttribute("moz-collapsed", "true");
		tempE.setAttribute("collapsed", "true");
	}

    } catch (e) {
	vkeyboard.consoleService.logStringMessage("**VKtoggle pad FAILED: " + e);
    }

}

// **** Function to reset VKboard *****
vkeyboard.VKboard_reset = function() {
	vkeyboard.collapse_VKboard();
	document.getElementById("VK_shift").setAttribute("label", "shift/caps");
	vkeyboard.current_VK_focus = null;
        vkeyboard.VK_focus_value = "";
}

vkeyboard.hideVKeyboard = function() {

try {
  var keyboardContainer = document.getElementsByTagName('gtoolbox')[0];

   if (keyboardContainer.getAttribute("hidden") == 'false') {
       keyboardContainer.setAttribute("hidden", true);
       vkeyboard.consoleService.logStringMessage("\n****\nSetting VKeyboard hidden\n****\n");
       vkeyboard.vKeyBoardURIBar("hideURI");
   } else {
        keyboardContainer.setAttribute("hidden", false);
        vkeyboard.consoleService.logStringMessage("\n****\nSetting VKeyboard visible\n****\n");  
   }
 } catch (e) {
   vkeyboard.consoleService.logStringMessage("Keyboard hide toggle failed because: " + e);
 }

}

vkeyboard.isUriBar = function()
{
  try{ 


   if ( vkeyboard.current_VK_focus.parentNode.parentNode.parentNode.getAttribute('id') == "urlbar")
   {

       var tmpID = vkeyboard.current_VK_focus.nodeName;
       var temp = vkeyboard.VK_focus_value;

       //vkeyboard.consoleService.logStringMessage("isUriBar VKEnter URLBar element: " + tmpID + " value: " + temp + "\n");

       vkeyboard.loadURI(temp);
   }

  } catch (e) {
	vkeyboard.consoleService.logStringMessage("FAILED VKEnter URLBar element " + tmpID + " value: " + temp + "\n" + e);
  }

}

vkeyboard.grippyClick = function() {
    //alert("Grippy Click function");
}

vkeyboard.vKeyBoardURIBar = function(focusedItem) {
    return;
    try {
    var toolbar = document.getElementById("VKboard1");
    var tmp = document.getElementById("urlbar");
    var vkURIBar = document.getElementById("vkboardURIBar");

    //vkeyboard.consoleService.logStringMessage("urlbar hidden: " + tmp.getAttribute("style"));

    // just hide vkeyboardURIBar and return
    /*
    if (focusedItem == "hideURI") {
             vkURIBar.setAttribute("style", "display: none;");
	     tmp.setAttribute("style", "display: visible;");
             return;
    }
    */
      if ( toolbar.hasAttribute("upGrippy") ) {
	 if (toolbar.getAttribute("upGrippy") == "expanded") {
	     if(vkURIBar.getAttribute("barisup") == "true") return;
	     //vkeyboard.consoleService.logStringMessage("VKboard1 is expanded");
             tmp.setAttribute("style", "display: none;");
	     vkURIBar.setAttribute("style", "display:visible;");
	     vkURIBar.setAttribute("flex", "1");
             vkURIBar.setAttribute("barisup", "true");
	     document.getElementById("vkboardURItxt").value = "";
             vkURIBar.focus();
	     return;
	 }

         if (toolbar.getAttribute("upGrippy") == "collapsed") {
	     document.getElementById("vkboardURItxt").value = "";
	     vkURIBar.setAttribute("style", "display: none;");
             vkURIBar.setAttribute("barisup", "false");
             tmp.setAttribute("style", "display: visible;");
	 }

      }

    } catch (e) {
	vkeyboard.consoleService.logStringMessage("vKeyBoardURIBar failed because: " + e);
    }

    return;
}

vkeyboard.vkURIBarGo = function() {
    try{
        var goURI = document.getElementById("vkboardURItxt").value;
        gBrowser.loadURI(goURI);
    } catch (e) {
        vkeyboard.consoleService.logStringMessage("vkURIBarGo failed because: " + e);
    }


}

// Rebuild the numeric/special keypad template
vkeyboard.rebuildNewContent = function() {
    
    var toggleSpecialPad = document.getElementById("specialpadRow2").getAttribute("datasources");

    if (toggleSpecialPad == "chrome://vkeyboard/content/specialPad.rdf") {
        document.getElementById("specialpadRow1").setAttribute("datasources", "chrome://vkeyboard/content/enUSKey.rdf");
        document.getElementById("specialpadRow2").setAttribute("datasources", "chrome://vkeyboard/content/enUSKey.rdf");
        document.getElementById("specialpadRow3").setAttribute("datasources", "chrome://vkeyboard/content/enUSKey.rdf");
    } else {
        document.getElementById("specialpadRow1").setAttribute("datasources", "chrome://vkeyboard/content/specialPad.rdf");
        document.getElementById("specialpadRow2").setAttribute("datasources", "chrome://vkeyboard/content/specialPad.rdf");
        document.getElementById("specialpadRow3").setAttribute("datasources", "chrome://vkeyboard/content/specialPad.rdf");
    }


}

// Rebuilds the VKeyBoard template from new rdf datasource
vkeyboard.rebuildKeyboard = function(newLocale) {
    try{
	var newlocale = "chrome://vkeyboard/content/" + newLocale;
        vkeyboard.consoleService.logStringMessage("New locale: " + newlocale);
        document.getElementById("keyboardRow1").setAttribute("datasources", newlocale);
        document.getElementById("keyboardRow2").setAttribute("datasources", newlocale);
        document.getElementById("keyboardRow3").setAttribute("datasources", newlocale);

        document.getElementById("specialpadRow1").setAttribute("datasources", newlocale);
        document.getElementById("specialpadRow2").setAttribute("datasources", newlocale);
        document.getElementById("specialpadRow3").setAttribute("datasources", newlocale);

        document.getElementById("numpadRow1").setAttribute("datasources", newlocale);
        document.getElementById("numpadRow2").setAttribute("datasources", newlocale);
        document.getElementById("numpadRow3").setAttribute("datasources", newlocale);

        document.getElementById("textNavPadRow1").setAttribute("datasources", newlocale);
        document.getElementById("textNavPadRow2").setAttribute("datasources", newlocale);
        document.getElementById("textNavPadRow3").setAttribute("datasources", newlocale);

        //vkeyboard.consoleService.logStringMessage("textNavPad data source is: " + document.getElementById("textNavPadRow3").getAttribute("datasources"));

    } catch (e) {
        vkeyboard.consoleService.logStringMessage("Apply new vkeyboard locale FAILED: " + e);
    }
}

//  Reads the locales listed in the chrome.manifest and adds 
//  each rdf datasource to the TGL menu button in the VKeyBoard
vkeyboard.listKeyboards = function() {

  var chromeRegService = Components.classes["@mozilla.org/chrome/chrome-registry;1"].getService();
  var xulChromeReg = chromeRegService.QueryInterface(Components.interfaces.nsIXULChromeRegistry);
  var toolkitChromeReg = chromeRegService.QueryInterface(Components.interfaces.nsIToolkitChromeRegistry);
		
  var selectedLocale = xulChromeReg.getSelectedLocale("vkeyboard");
  var availableLocales = toolkitChromeReg.getLocalesForPackage("vkeyboard");

 try {
    var keyboards = document.getElementById("installedKeyboards");
    while (availableLocales.hasMore()){
        var tmp = availableLocales.getNext();
        var tmpFile = tmp + "Key.rdf";
        vkeyboard.consoleService.logStringMessage("Installed Locale: " + tmp);
        var newItem = document.createElement("menuitem");
        newItem.setAttribute("id", tmp);
        newItem.setAttribute("label", tmp);
        newItem.setAttribute("tooltiptext", tmp);
        newItem.setAttribute("type", "radio");
        newItem.setAttribute("oncommand", "vkeyboard.rebuildKeyboard('" + tmpFile + "');");
        keyboards.appendChild(newItem);
    }

 }catch (e){
      vkeyboard.consoleService.logStringMessage("Adding menuitems failed with: " + e);
 }

}

// Cursor positioning in focused field functions
vkeyboard.moveCursorUp = function() {
      var pressKey = document.createEvent("KeyboardEvent");
      pressKey.initKeyEvent("keypress", true, true, null, 
	                   false, false, false, false,
			    38, 0);
      var dispatchPressKey = vkeyboard.current_VK_focus.dispatchEvent(pressKey);
      vkeyboard.current_VK_focus.focus();
}

vkeyboard.moveCursorDown = function() {
      var pressKey = document.createEvent("KeyboardEvent");
      pressKey.initKeyEvent("keypress", true, true, null, 
	                   false, false, false, false,
			    40, 0);
      var dispatchPressKey = vkeyboard.current_VK_focus.dispatchEvent(pressKey);
      vkeyboard.current_VK_focus.focus();
}

vkeyboard.moveCursorRight = function() {
      var pressKey = document.createEvent("KeyboardEvent");
      pressKey.initKeyEvent("keypress", true, true, null, 
	                   false, false, false, false,
			    39, 0);
      var dispatchPressKey = vkeyboard.current_VK_focus.dispatchEvent(pressKey);
      vkeyboard.current_VK_focus.focus();
}

vkeyboard.moveCursorLeft = function() {
      var pressKey = document.createEvent("KeyboardEvent");
      pressKey.initKeyEvent("keypress", true, true, null, 
	                   false, false, false, false,
			    37, 0);
      var dispatchPressKey = vkeyboard.current_VK_focus.dispatchEvent(pressKey);
      vkeyboard.current_VK_focus.focus();
}

vkeyboard.moveCursorHome = function() {
      var pressKey = document.createEvent("KeyboardEvent");
      pressKey.initKeyEvent("keypress", true, true, null, 
	                   false, false, false, false,
			    36, 0);
      var dispatchPressKey = vkeyboard.current_VK_focus.dispatchEvent(pressKey);
      vkeyboard.current_VK_focus.focus();
}

vkeyboard.moveCursorEnd = function() {
      var pressKey = document.createEvent("KeyboardEvent");
      pressKey.initKeyEvent("keypress", true, true, null, 
	                   false, false, false, false,
			    35, 0);
      var dispatchPressKey = vkeyboard.current_VK_focus.dispatchEvent(pressKey);
      vkeyboard.current_VK_focus.focus();
}

// Global listeners
window.addEventListener("load", vkeyboard.collapse_VKboard, false);
window.document.addEventListener("click", vkeyboard.item_got_focus, true);