// Copyright (c) 2006 OPENXTRA Ltd.
// All rights reserved

var gadgetVer = 1.0;

var maxDockedWidth      = "130";
var maxDockedHeight     = "174";

var maxProbes = 16;

var maxProbesPerPage = 3;

// The device from which the values will be read
var device = null;

// Array of current values from the device
var currentReadings = new Array();

var probeOffset = 0;

////////////////////////////////////////////////////////////////////////////////
//
//
////////////////////////////////////////////////////////////////////////////////
function loadMain() {

	System.Gadget.settingsUI = "settings.html";
    System.Gadget.onSettingsClosed = SettingsClosed;
	System.Gadget.onUndock = docked;
	System.Gadget.onDock = docked;
	System.Gadget.Flyout.file = "HotSpotFlyout.html";
	System.Gadget.background = "url('../images/box.png')";
	createDevice();
	updateReadings();
	window.setInterval(updateReadings, (60 * 1000));
}
////////////////////////////////////////////////////////////////////////////////
//
//
////////////////////////////////////////////////////////////////////////////////
function docked() {
	with (document.body.style) {
		width = maxDockedWidth; 
		height = maxDockedHeight;
	}
}
////////////////////////////////////////////////////////////////////////////////
//
//
////////////////////////////////////////////////////////////////////////////////
function hideFlyout()
{
   System.Gadget.Flyout.show = false;
}
////////////////////////////////////////////////////////////////////////////////
//
//
////////////////////////////////////////////////////////////////////////////////
function createDevice() {
	if (device == null) {
  		try {
		    device = new ActiveXObject("HotSpot.Sensor");
		} catch (e) {
			device = null;
		    return;
		}
	}
}
////////////////////////////////////////////////////////////////////////////////
//
//
////////////////////////////////////////////////////////////////////////////////
function updateReadings() {
	deviceAddress = System.Gadget.Settings.read("deviceAddress");
	
	hideProbeReadings();
	
	if(device == null) {
		header.innerHTML = 'This gadget requires <a href="http://www.openxtra.co.uk/downloads/hotspot-sdk.php">HotSpotSDK</a>.';
		return;
	}
	
	if (deviceAddress != "") {
		try {
			clearReadings();
			device.Address = deviceAddress;
			device.Poll();
			
			header.innerHTML = '<h1 title="' + device.Address + '"><a href="http://' + device.Address + '/"/>' + device.Address + '</a></h1>';
			
			var readingCounter = 0;
			var probes = device.Probes;
			for (var probeCounter = 1; probeCounter <= probes.Count; probeCounter++) {
				var probe = probes.Item(probeCounter);
				var latestReading = probe.LatestReading;
				var nullValue;
				switch (device.Model) {
					case "EM1":
					case "Senturion":
						nullValue = -999.0;
						break;
	
					case "E4":
					case "E16":
					case "ModelF":
					default:
						nullValue = -99.0;
						break;
				}
				
				var valueWithUnit = "";
	
				try {
					if (latestReading.Value > nullValue) {
						valueWithUnit = latestReading.Value + " " + latestReading.Unit;
						currentReadings[readingCounter++] = new Array(probe.Name, probe.Group, probe.Number, valueWithUnit);
					} else {
						valueWithUnit = "No reading";
						currentReadings[readingCounter++] = new Array(probe.Name, probe.Group, probe.Number, valueWithUnit);
					}
				} catch (e) {
				}
			}
			updateDisplay();
		} catch (e) {
		}
	} else {
		header.innerText = "Please configure device address.";
	}
}
////////////////////////////////////////////////////////////////////////////////
//
//
////////////////////////////////////////////////////////////////////////////////
function clearReadings() {
	// Clean out the existing readings
	currentReadings.length = 0;
	currentReadings = new Array();
	probeOffset = 0;
}
////////////////////////////////////////////////////////////////////////////////
//
//
////////////////////////////////////////////////////////////////////////////////
function updateDisplay() {	
	var probe = 0;
	
	if(currentReadings.length == 0) {
		return;
	}
	
	hideProbeReadings();
	
	for (var i = probeOffset; i < currentReadings.length; i++) {
		
		if(probe >= maxProbesPerPage){
			break;
		}
		
		var currentReading = currentReadings[i];
		var simpleReading = formatSimpleReading(currentReading);
		
		System.Gadget.Flyout.file = "HotSpotFlyout.html";

		document.getElementById("probe" + (probe)).innerHTML = '<div onclick="showFlyout(\'' + currentReading[0] + '\',\'' + currentReading[1] + '\',\'' + currentReading[2] + '\',\'' + currentReading[3] + '\');">' + simpleReading + '</div>';
		document.getElementById("probe" + (probe)).title = currentReading[0] + ': ' + currentReading[3];
		document.getElementById("display_probe" + (probe)).style.visibility = "visible";
		
		probe++;
	}
	
	probeNumbers.innerHTML =  ((probeOffset + maxProbesPerPage) / maxProbesPerPage) + ' of ' + Math.ceil((currentReadings.length / maxProbesPerPage));
	
}
////////////////////////////////////////////////////////////////////////////////
//
//
////////////////////////////////////////////////////////////////////////////////
function formatSimpleReading(currentReading) {
	var readingstr = "";
	
	name = currentReading[0];
	group = currentReading[1];
	number = currentReading[2];
	value = currentReading[3];
	
	readingstr += "&nbsp;" + name + ":";
	readingstr += "<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + value;
	
	return readingstr;
}
////////////////////////////////////////////////////////////////////////////////
//
//
////////////////////////////////////////////////////////////////////////////////
function buildProbeInfoPage()
{

    try {
        document.write('<h1>' +  System.Gadget.Settings.read("sName") + '</h1>');
		document.write('<p>Probe ' + System.Gadget.Settings.read("sNumber") + '<br />');
		document.write('Probe Group: ' +  System.Gadget.Settings.read("sGroup") + '<br />');
		document.write('Probe Value: ' +  System.Gadget.Settings.read("sValue") + '</p>');
	} catch(e) {
    }   
}
////////////////////////////////////////////////////////////////////////////////
//
//
////////////////////////////////////////////////////////////////////////////////
function loadSettings() {
	System.Gadget.onSettingsClosing = SettingsClosing;
	deviceAddress.value = System.Gadget.Settings.read("deviceAddress");
}
////////////////////////////////////////////////////////////////////////////////
//
// functions/events to do when settings page is about to close
//
////////////////////////////////////////////////////////////////////////////////
function SettingsClosing(event) {
    if (event.closeAction == event.Action.commit)
    {
        System.Gadget.Settings.write("GadgetViewed","yes");
        SaveSettings();
    }
    else if(event.closeAction == event.Action.cancel)
    {
    }
    event.cancel = false;
}
////////////////////////////////////////////////////////////////////////////////
//
// save the new settings
//
////////////////////////////////////////////////////////////////////////////////
function SaveSettings() {
    System.Gadget.Settings.write("deviceAddress", deviceAddress.value);
}
////////////////////////////////////////////////////////////////////////////////
//
//
////////////////////////////////////////////////////////////////////////////////
function showFlyout(sName, sGroup, sNumber, sValue) {
	System.Gadget.Settings.write("sName", sName);
	System.Gadget.Settings.write("sGroup", sGroup);
	System.Gadget.Settings.write("sNumber", sNumber);
	System.Gadget.Settings.write("sValue", sValue);
    System.Gadget.Flyout.file = "HotSpotFlyout.html";
    System.Gadget.Flyout.show = true;
}
////////////////////////////////////////////////////////////////////////////////
//
//
////////////////////////////////////////////////////////////////////////////////
function startUpPage() {
    
}
////////////////////////////////////////////////////////////////////////////////
//
//
////////////////////////////////////////////////////////////////////////////////
function toggleButton(objToChange, newSRC)
{        
   eval("objToChange").src = "images/"+newSRC;
}
////////////////////////////////////////////////////////////////////////////////
//
//
////////////////////////////////////////////////////////////////////////////////
function setPreviousViewItems() {
	probeOffset = probeOffset - maxProbesPerPage;
	
	if(probeOffset < 0) {
		probeOffset = 0;
	}
	updateDisplay();
}
////////////////////////////////////////////////////////////////////////////////
//
//
////////////////////////////////////////////////////////////////////////////////
function setNextViewItems() {
	if(probeOffset + probeOffset >= currentReadings.length) {
	} else {
		probeOffset = probeOffset + maxProbesPerPage;
	}
	
	updateDisplay();
}
////////////////////////////////////////////////////////////////////////////////
//
//
////////////////////////////////////////////////////////////////////////////////
function hideProbeReadings() {
	display_probe0.style.visibility = "hidden";
	display_probe1.style.visibility = "hidden";
	display_probe2.style.visibility = "hidden";
}