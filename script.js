const kep = document.querySelector('#karikep'), div = document.querySelector('#mainContent'),
clamp = (val, min, max) => {
	if (val < min)
		return min;
	else if (val > max)
		return max;
	else
		return val;
};
div.addEventListener('mousemove', e => kep.style.marginTop = clamp(e.clientY - div.getBoundingClientRect().top - kep.clientHeight, -64, 50) + 'px', false);