const map = document.getElementById('map');
const container = document.getElementsByClassName('container');
const selectors = document.getElementsByTagName('select');
const svgObject = document.getElementById('svgMap');
let sortedCountries = [];

window.onload = function () {

    for (const [key, value] of Object.entries(tz.countries)) {
        Array.prototype.forEach.call(svgObject.contentDocument.getElementsByTagName('text'), marker => {
            if (value.zones.includes(marker.id)) {
                if(!sortedCountries.includes(value.name)){
                    sortedCountries.push(value.name)
                }
            }
        })
    }
    sortedCountries.sort();
    sortedCountries.forEach(country => {
        let opt = document.createElement('option');
        opt.text = country;
        selectors[0].add(opt, country.index);
    })

    if ('contentDocument' in svgObject) {
        const svgDom = svgObject.contentDocument;

        const countries = svgDom.getElementsByTagName('path')

        const markers = svgDom.getElementsByTagName('text')
        Array.prototype.forEach.call(markers, marker => {
            marker.style.display = 'none';
            Array.prototype.forEach.call(container, item => {
                setStyle(item, marker)
            })
        })

        Array.prototype.forEach.call(countries, country => {
            country.setAttribute('fill', '#424242');
            country.addEventListener('mouseenter', function (event) {
                event.target.style.fill = `#606060`
                event.target.style.transition = 'all 0.2s ease';
            })
            country.addEventListener('mouseleave', function (event) {
                if (event.target.classList.contains('enabled')) {
                    event.target.style.fill = `#91c034`;
                } else event.target.style.fill = ``;
            })
        })


    }
}

function createCitySelector() {
    let selectorA = selectors[0];
    let country = selectorA[selectorA.selectedIndex].value;
    for (const [key, value] of Object.entries(tz.countries)) {
        if (value.name === country.trim()) {
            let selectorB = selectors[1];
            let length = selectorB.options.length;
            for (let i = length - 1; i >= 0; i--) {
                selectorB.options[i] = null;
            }
            value.zones.forEach(zone => {
                Array.prototype.forEach.call(svgObject.contentDocument.getElementsByTagName('text'), marker => {
                    if (marker.id === zone.trim()) {
                        let opt = document.createElement('option');
                        opt.text = zone;
                        selectorB.add(opt, country.index);
                    }
                })
            })
        }
    }


}

function addContainer(hours, minutes, timeZone, zone) {
    let location = zone.split('/')
    let exist = false;
    Array.prototype.forEach.call(container, item => {
        if (location[1] === item.id) {
            exist = true
        }
    })
    if (!exist) {
        let ol = document.getElementById('time-box');
        let li = document.createElement('li')
        li.setAttribute('class', 'container')
        if (hours > 6 && hours < 20) {
            li.classList.add('day')
        }
        li.setAttribute('id', location[1])
        li.innerHTML += `<h1>${hours}:${minutes}</h1><h5>${timeZone}</h5><div class=\"location\"><h2>${location[0]}</h2><h2>${location[1]}</h2></div>`;
        ol.append(li);
    }
}

function closeNav() {
    document.getElementById("overlay").style.width = "0%";
}

function openNav() {
    document.getElementById("overlay").style.width = "100%";
}

function selectHandler() {
    let selector = selectors[1]
    getDate(selector[selector.selectedIndex].value)
    closeNav();
}

function setStyle(zone, hours, minutes) {
    console.log(zone)
    let location = zone.split('/')
    Array.prototype.forEach.call(svgObject.contentDocument.getElementsByTagName('text'), marker => {
        if (zone.trim() === marker.id) {
            markerStyler(marker)
        }
    })

    function markerStyler(marker) {
        marker.style.display = '';
        // marker.innerHTML = `<tspan>&#8226; ${location[1]}</tspan><tspan dx="-2.4em" dy="1em"> ${hours}:${minutes}</tspan>`;
        marker.innerHTML = `<tspan>&#8226; ${location[1]} ${hours}:${minutes}</tspan>`;
        marker.style.fill = 'grey'
        if (hours > 6 && hours < 20) {
            marker.style.fill = '#91c034'
        }
        marker.style.fontSize = '14pt'
        marker.style.fontFamily = '\'Work Sans\', sans-serif'
    }
}

function getDate(zone) {
    fetch(`https://worldtimeapi.org/api/timezone/${zone}`)
        .then(response => response.json())
        .then(data => {
            let dateTime = new Date(data["datetime"].substring(0, 19))

            // response
            // abbreviation: +04
            // client_ip: 176.38.168.35
            // datetime: 2020-10-12T13:20:07.407534+04:00
            // day_of_week: 1
            // day_of_year: 286
            // dst: false
            // dst_from:
            // dst_offset: 0
            // dst_until:
            // raw_offset: 14400
            // timezone: Asia/Dubai
            // unixtime: 1602494407
            // utc_datetime: 2020-10-12T09:20:07.407534+00:00
            // utc_offset: +04:00
            // week_number: 42

            addContainer(('0' + dateTime.getHours()).slice(-2), ('0' + dateTime.getMinutes()).slice(-2), data['abbreviation'], zone)
            setStyle(zone, ('0' + dateTime.getHours()).slice(-2), ('0' + dateTime.getMinutes()).slice(-2));
        });
}