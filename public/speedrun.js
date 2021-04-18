const srcLookup = async () => {
    // Convert seconds to a readable format
    const convert = time => {
        let hr, min, sec, ms;
        let parts = time.toString().split('.');
        ms = parts.length > 1 ? parseInt((parts[1] + '00').substr(0,3)) : undefined;
        sec = parseInt(parts[0]);
        if (sec >= 60) {min = Math.floor(sec / 60); sec = ('0' + (sec % 60)).substr(-2, 2);}
        if (min >= 60) {hr = Math.floor(min / 60); min = ('0' + (min % 60)).substr(-2, 2);}
        if (ms !== undefined) ms = ('00' + ms).substr(-3, 3);
        if (min === undefined) return ms === undefined ? '0:' + sec.toString() : '0:' + sec.toString() + '.' + ms.toString();
        else if (hr === undefined) return ms === undefined ? min.toString() + ':' + sec.toString() : min.toString() + ':' + sec.toString() + '.' + ms.toString();
        else return ms === undefined ? hr.toString() + ':' + min.toString() + ':' + sec.toString() : hr.toString() + ':' + min.toString() + ':' + sec.toString() + '.' + ms.toString();
    }

    // Finding the game
    const gameAbbreviation = document.getElementById('game').value;
    const gameResponse = await fetch('https://www.speedrun.com/api/v1/games?abbreviation=' + gameAbbreviation + '&embed=categories');
    const gameObject = await gameResponse.json();
    if (gameObject.data.length === 0) {
        alert('game not found');
        return;
    }
    const foundGame = gameObject.data[0];
    const gameId = foundGame.id;

    // Finding the category
    const categoryName = document.getElementById('category').value;
    const categoryObject = foundGame.categories.data.find(c => c.name.toLowerCase() === categoryName.toLowerCase());
    if (categoryObject === undefined) {
        alert('category not found');
        return;
    }
    const categoryId = categoryObject.id;

    // Find subcategories, if any
    const variablesResponse = await fetch(categoryObject.links.find(l => l.rel === 'variables').uri);
    const variablesObject = await variablesResponse.json();
    // Create an array holding relevant subcategory data in a more manageable format
    const subcategoryArray = variablesObject.data.filter(v => v['is-subcategory'] === true).map(o => ({
        'id': o.id,
        'subcats': Object.entries(o.values.values).map(x => ({
            'id': x[0],
            'name': x[1].label
        }))
    }));
    const subcategoryNames = document.getElementById('subcategories').value;
    let variablesQuery = '';
    let subcategoryCollection = []; 
    // Go through each subcategory in input, and find correct values
    if (subcategoryNames !== '' && subcategoryNames !== undefined) {
        const subcategoryNameArray = subcategoryNames.split(';');
        subcategoryNameArray.forEach(subcategory => {
            const foundSubcategory = subcategoryArray.find(s => s.subcats.find(c => c.name.toLowerCase() === subcategory.toLowerCase()) !== undefined);
            if (foundSubcategory === undefined) {
                alert('subcategory not found');
                return;
            }
            const foundSubcategoryValue = foundSubcategory.subcats.find(c => c.name.toLowerCase() === subcategory.toLowerCase()).id;
            subcategoryCollection.push({'key': foundSubcategory.id, 'val': foundSubcategoryValue});
            variablesQuery += '&var-' + foundSubcategory.id + '=' + foundSubcategoryValue;
        });
    }

    // Get the world record time
    const leaderboardResponse = await fetch('https://www.speedrun.com/api/v1/leaderboards/' + gameId + '/category/' + categoryId + '?top=1' + variablesQuery);
    const leaderboardObject = await leaderboardResponse.json();
    const wrSeconds = leaderboardObject.data.runs[0].run.times.primary_t;
    document.getElementById('wr').innerHTML = convert(wrSeconds);
    
    // If Twitch name is present, find personal best
    const runnerName = document.getElementById('name').value;
    if (runnerName === '') {
        document.getElementById('pb').innerHTML = 'N/A';
        return;
    }
    const runnerResponse = await fetch('https://www.speedrun.com/api/v1/users?twitch=' + runnerName);
    const runnerObject = await runnerResponse.json();
    if (runnerObject.data.length === 0) {
        alert('runner not found');
        return;
    }
    const runnerId = runnerObject.data[0].id;
    const pbResponse = await fetch('https://www.speedrun.com/api/v1/users/' + runnerId + '/personal-bests?game=' + gameId);
    const pbObject = await pbResponse.json();
    if (pbObject.data.length === 0) {
        document.getElementById('pb').innerHTML = 'N/A';
        return;
    }
    let foundRun;
    if (variablesQuery === '') foundRun = pbObject.data.find(r => r.run.category === categoryId);
    else {
        let categoryRuns = pbObject.data.filter(r => r.run.category === categoryId);
        if (categoryRuns.length === 0) {
            document.getElementById('pb').innerHTML = 'N/A';
            return;
        }
        else if (categoryRuns.length === 1) foundRun = categoryRuns[0];
        // If there are subcategories, narrow down until 1 run remains
        else for (let i = 0; i < subcategoryCollection.length; i++) {
            categoryRuns = categoryRuns.filter(r => r.run.values[subcategoryCollection[i].key] === subcategoryCollection[i].val);
            if (categoryRuns.length === 0) {
                document.getElementById('pb').innerHTML = 'N/A';
                return;
            }
            if (categoryRuns.length === 1) {
                foundRun = categoryRuns[0];
                break;
            }
        }
    }
    const pbSeconds = foundRun.run.times.primary_t;
    document.getElementById('pb').innerHTML = convert(pbSeconds);
    
}