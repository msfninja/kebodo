const
	chooseABuildBtn = $('chooseABuildBtn'),
	chooseBuild = $('chooseBuild');

chooseBuild.style.transition = 'ease 500ms';

chooseABuildBtn.addEventListener('click',() => {
	chooseBuild.style.display = 'block';
	setTimeout(() => {
		chooseBuild.style.opacity = '1';
		document.body.style.overflowY = 'hidden';
	},50);
});

function choose() {
	chooseBuild.style.display = 'block';
	setTimeout(() => {
		chooseBuild.style.opacity = '1';
		document.body.style.overflowY = 'hidden';
	},50);
}