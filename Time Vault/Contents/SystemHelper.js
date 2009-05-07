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


function recurseCopy(iFromFolder, iToFolder) {
	var items = filesystem.getDirectoryContents(iFromFolder, false);
	
	for (var i = 0; i < items.length; i++) {
		var itemName = items[i];
		var itemPath = iFromFolder + "/" + itemName;
		var targetName = iToFolder + "/" + itemName;
					
		if (filesystem.isDirectory(itemPath)) {
			if (!filesystem.isDirectory(targetName)) {
				filesystem.createDirectory(targetName);
			}
			recurseCopy(itemPath, targetName);
		} else {
			filesystem.copy(itemPath, targetName);			
		}		
	}
}