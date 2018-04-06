NYC Council Bulletin Board
--------------------------

This digital bulletin board lives as a Github Page.

Using the [NYC Legistar API](http://webapi.legistar.com/Home/Examples), this bulletin board makes 3 GET requests

- Events - To get the full schedule of hearings, meetings, and events.
- Event Items - To get the associated items that are relevant to the hearings.
- Body (Committees and Subcommittees) - To get the Chairperson of each committee and/or subcommittee

Features include
- Turn auto scrolling on/off when you click the NYC Seal.
- While the page is auto scrolling, a touch/click on the page will temporarily pause auto scrolling for 10 seconds before resuming. (This allows users to free scroll through the page or scroll through event items of a hearing.)
- When auto scrolling reaches the bottom of the page, it will reset to the top and start again.
- To get the most update-to-date info, the page will refresh and make all 3 GET requests on the hour, every hour.

This bulletin board is meant to replace the paper counterpart in City Hall's lobby.