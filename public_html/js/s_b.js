var $ = (id) => { return document.getElementById(id); };

const
	body = document.body,
	scratch = $('buildFromScratchBtn'),
	scratchBuild = $('scratchBuild-pcb'),
	scratchBuildInnerHTML = $('scratchBuildInnerHTML-pcb');

scratchBuild.style.opacity = '0';
scratchBuild.style.transition = 'ease 300ms';
scratchBuildInnerHTML.style.opacity = '0';
scratchBuildInnerHTML.style.transition = 'ease 500ms';

scratch.addEventListener('click',() => {
	scratchBuild.style.display = 'block';
	setTimeout(() => {
		scratchBuild.style.opacity = '1';
	},100);
	setTimeout(() => {
		scratchBuildInnerHTML.style.opacity = '1';
		$('builder').style.display = 'none';
		$('builderBg').style.display = 'none';
		$('footer').style.display = 'none';
	},600);
	body.style.overflowY = 'hidden';
});

var filterList = (item) => {
	var
		input = $('searchKeyboardParts' + item),
		filter = input.value.toUpperCase(),
		ul = $('searchList' + item),
		li = ul.getElementsByTagName('li');

	for(i = 0; i < li.length; i++) {
		a = li[i].getElementsByTagName('a')[0];
		txtValue = a.textContent || a.innerText;
		if(txtValue.toUpperCase().indexOf(filter) > -1) {
			li[i].style.display = '';
		} else {
			li[i].style.display = 'none';
		}
	}
};

var tabArr = ['pcb'];
var index_id0001 = 1;

var switchTab = (prev,next) => {
	tabArr.push(next);
	index_id0001++;
	$('scratchBuild-' + prev).style.transition = 'ease 750ms';
	$('scratchBuild-' + next).style.display = 'block';
	$('scratchBuild-' + next).style.transition = 'ease 750ms';
	$('scratchBuild-' + next).style.zIndex = (500 + index_id0001).toString();
	setTimeout(() => {
		$('scratchBuild-' + next).style.transform = 'translateY(0)';
		$('scratchBuild-' + prev).style.transform = 'translateY(100vh)';
	},10);
	setTimeout(() => {
		$('scratchBuild-' + prev).style.display = 'none';
	},800);
};

var setPart = (type,part) => {
	//
};