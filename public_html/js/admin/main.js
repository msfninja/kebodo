var signOutAdmin = () => {
	var expires = (new Date(Date.now() - (86400 * 1000))).toUTCString();
	document.cookie = 'TOKEN=; expires' + expires + '; path=/;';
	window.location.reload(true);
};

var filterIp = () => {
	var
		input = $('ipSearch'),
		filter = input.value.toUpperCase(),
		ul = $('ipList'),
		li = ul.getElementsByTagName('div');

	for(i = 0; i < li.length; i++) {
		div = li[i].getElementsByClassName('ip-address')[0];
		txtValue = div.innerText;
		if(txtValue.toUpperCase().indexOf(filter) > -1) {
			li[i].style.display = '';
		} else {
			li[i].style.display = 'none';
		}
	}
};
