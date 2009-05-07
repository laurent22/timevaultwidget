﻿/*
    This script is part of the "Time Vault" Widget
    
    Copyright (C) 2008 Laurent Cozic
    Contact: laurent@cozic.net

    This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation; either version 2 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program; if not, write to the Free Software
    Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA
    
    -------------------------------------------------------------------------
*/


function Project() {
	this._id = undefined;
	this._name = loc("drawer_projects_newProject");
	this._disposed = false;
	this.timeBudget = null;
	this.ratePerHour = null;
	this.createdDate = null;
	this.notes = "";
	this._archived = false;
}


Project.prototype = new EventInterface();


Project.prototype.id getter = function() { return this._id; }
Project.prototype.id setter = function(v) { this._id = v; }

Project.prototype.name getter = function() {return this._name == DEFAULT_DATABASE_STRING ? loc("global_defaultProjectName") : this._name; }
Project.prototype.name setter = function(v) { this._name = v; }

Project.prototype.archived getter = function() {return this._archived; }
Project.prototype.archived setter = function(v) { this._archived = v; }

Project.prototype.disposed getter = function() { return this._disposed; }

Project.prototype.duration getter = function() {
	var events = this.getEvents();
	var output = 0;
	for (var i = 0; i < events.length; i++) {
		output += events[i].duration;
	}
	return output;
}


Project.prototype.durationUserString getter = function() {
	return Main.getDurationString(this.duration);
}


Project.prototype.getEvents = function() {
	return gDatabase.getEventsFromProjectID(this.id);
}


Project.prototype.getPossibleTasks = function() {
	return gDatabase.getPossibleTasksFromProjectID(this.id);
}


Project.prototype.hasPossibleTask = function(iID) {
	var tasks=  this.getPossibleTasks();
	for (var i = 0; i < tasks.length; i++) {
		var task = tasks[i];
		if (task.id == iID) return true;
	}
	return false;
}

Project.prototype.toString = function() {
	return this.name;
}


Project.prototype.save = function() {
	gDatabase.saveItem(this);
}


Project.prototype.dispose = function() {
	this._disposed = true;
	gDatabase.deleteItem(this);
}


Project.prototype.toCSV = function(iHeaders, iReportType) {
	if (iReportType == null) iReportType = 0;
	
	var output = "";
	var events = this.getEvents();
	var divider = preferences.reportDataDelimiter.value;
		
	switch (iReportType)
	{
	    case 1:
	    {
    		var rows = [];

		    for (var i = 0; i < events.length; i++) {
			    var event = events[i];
    			
			    var d = event.startDate.duplicate();
    			
			    d.setHours(0);
			    d.setMinutes(0);
			    d.setSeconds(0);
			    d.setMilliseconds(0);
    			
			    d = d.getTime();
    			
			    var row = null;	
    			
			    for (var j = 0; j < rows.length; j++) {
				    var r = rows[j];
				    if (r.timeStamp == d) {
					    row = r;
					    break;
				    }
			    }
    			
			    if (row == null) {
				    row = {	timeStamp : d, date : event.startDate, totalTime : 0 };
				    rows.push(row);
			    }
    			
			    row.totalTime += event.duration;
		    }				
    		
    		
		    function sortRows(a, b) {
			    if (a.timeStamp < b.timeStamp) return -1;
			    if (a.timeStamp > b.timeStamp) return +1;
			    return 0;
		    }
    		
		    rows.sort(sortRows);
    		
    		
		    output = loc("dailyReport_headerDate") + divider + loc("dailyReport_headerTotalTime") + "\n";
    		
		    for (var i = 0; i < rows.length; i++) {
			    var row = rows[i];
			    output += Main.getNumericDate(row.date);
			    output += divider;
			    output += Main.getDurationString(row.totalTime);
			    output += "\n";
		    }
		    
		    break;
        }
    case 2:
        {
            var rows = [];
            
		    for (var i = 0; i < events.length; i++) {
			    var event = events[i];
    			
			    var row = null;
			    var eventDesc = event.description;
			    			    
			    for (var j = 0; j < rows.length; j++) {
				    var r = rows[j];
				    if (r.description == eventDesc) {
					    row = r;
					    break;
				    }
			    }
			    
			        			
			    if (row == null) {
				    row = {	description: eventDesc, totalTime : 0 };
				    rows.push(row);
			    }
    			
			    row.totalTime += event.duration;
		    }				
    		
		    output = loc("preferencesOption_reportHeader4") + divider + loc("dailyReport_headerTotalTime") + divider + "Total Hours" + "\n";
            
            var tasks = this.getPossibleTasks();
    		
		    for (var i = 0; i < rows.length; i++) {
			    var row = rows[i];
		    	// lookup the task id in the task list
		    	for (var j = 0; j < tasks.length; j++) {
	                var task = tasks[j];
	                if (task.id == row.description)
	                {
	                    output += task.description;
	                    break;
	                }
                }
			    output += divider;
			    output += Main.getDurationString(row.totalTime);
			    output += divider;
			    output += row.totalTime / (1000 * 60 * 60);
			    output += "\n";
		    }
            
            
            break;
        }
	default:
	    {
		    if (iHeaders == undefined) {
			    elog("Project.toCSV: headers must be defined");
			    return;
		    }
    		
		    if (!(iHeaders instanceof Array)) return;
		    if (iHeaders.length <= 0) return;
    			
		    for (var i = 0; i < iHeaders.length; i++) {
			    var h = iHeaders[i];
			    if (i != 0) output += divider;
			    output += h.title;
		    }	
    		
		    output += "\n";
    			
		    for (var i = 0; i < events.length; i++) {
			    var event = events[i];
			    for (var j = 0; j < iHeaders.length; j++) {
				    var h = iHeaders[j];
				    if (j != 0) output += divider;
				    output += event[h.propertyName];
			    }			
			    output += "\n";
		    }		
    	
	        break;	
	    }
	}
	
	return output;
}


Project.prototype.publish = function(iFilePath, iHeaders, iType) {
	var s = this.toCSV(iHeaders, iType);
	if (s == undefined) return;
	filesystem.writeFile(iFilePath, s);
}