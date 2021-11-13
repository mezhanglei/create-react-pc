function SendRequest(urls,max,callback){
	let i = 0;
    const alltasks = [];
    const executing = [];
	const fifo = function(){
		if(urls.length===0){
			return Promise.resolve();
		}
		const item = urls[i++];
		const pr = Promise.resolve().then(()=>fetch(item));
		alltasks.push(pr);
		const end = pr.then(()=>executing.splice(executing.indexOf(end), 1))
		executing.push(end);
		let r = Promise.resolve();
		if (executing.length >= poolLimit) {
			r = Promise.race(executing);
		}
	}
	 return fifo().then(() => Promise.all(alltasks));
}