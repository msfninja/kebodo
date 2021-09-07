'use strict';

qs = (e) -> return document.querySelectorAll e

hdr = qs('#desktop')[0]
hdrArea = qs('#header-area')[0]

setBtnNav = ->
	arr = window.location.pathname.split('/')
	path = arr[arr.length - 1]
	qs('.btn-nav').forEach (e) ->
		if ![undefined,null].includes e.dataset.nav
			if e.dataset.nav is path
				e.classList.add 'selected'
				e.removeAttribute 'onclick'
			else
				e.classList.remove 'selected'
				e.setAttribute 'onclick',"window.location.pathname = '/#{e.dataset.nav}';"
		return
	return

header = (c) ->
	if c
		hdr.style.transform = 'translate(0,0)'
	else
		hdr.style.transform = 'translate(0,-100%)'

startType = ->
	qs('.type').forEach (e) ->
		str = e.innerText
		e.innerText = ''
		delay = e.dataset.typeDelay
		stop = e.dataset.typeStop
		speed = e.dataset.typeSpeed
		id = Math.random().toString().substr 2,8
		style = document.createElement 'style'
		style.setAttribute 'type','text/css'
		document.head.appendChild style

		if  !delay
			delay = 0

		if stop
			e.id = "id#{id}"

		if !speed
			speed = 75
		else
			speed = speed * 1000

		setTimeout (->
			arr = str.split('')
			arr.push(null)
			e.style.opacity = '1'
			arr.forEach (f,j,b) ->
				setTimeout (->
					if j < b.length - 1
						e.innerText += str[j]
					else if stop
						setTimeout (->
							style.innerHTML = "\#id#{id}::after { opacity: 0 !important; }"
							return
						),750
					return
				),j * speed
				return
			return
		),delay * 1000
		return
	return

startDelay = ->
	qs('.delay').forEach (e) ->
		if e.dataset.delay
			setTimeout (->
				e.style.opacity = '1'
				return
			),e.dataset.delay * 1000
		return
	return

qs('.btn-nav-drop').forEach (e,i) ->
	e.setAttribute('tabindex',i)
	arr = Array.prototype.slice.call(e.querySelectorAll('*'))
	cnt = e.querySelector('.cnt')
	arr.push e
	cnt.style.top = "#{hdr.clientHeight + 10}px"
	arr.forEach (f) ->
		f.addEventListener 'focus',->
			cnt.style.transform = 'translate(0,0)'
			cnt.style.opacity = '1'
			return
		f.addEventListener 'blur',->
			cnt.style.transform = 'translate(0,-100%)'
			cnt.style.opacity = '0'
			return
		return
	return

qs('a').forEach (e) ->
	e.title = e.href
	return

qs('span').forEach (e) ->
	if Object.keys(e.dataset).length
		if e.dataset.ins is 'currentYear'
			e.innerHTML += (new Date).getFullYear()
	return

qs('#btn-nav-header-search')[0].addEventListener 'click',->
	qs('#input-header-search')[0].focus()
	return

hdrArea.addEventListener 'mouseover',->
	header on
	return

document.body.onscroll = ->
	if window.scrollY > 0
		header on
	else
		header off
	return

document.body.onload = ->
	setBtnNav()
	startType()
	startDelay()
	qs('#cnt')[0].style.opacity = '1'
	document.body.style.overflowY = 'auto'
	return