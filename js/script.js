const images=["","../images/zero-compr.png","../images/cross-compr.png"]
const langList=["","ar","de","en","es","fr","he","it","nl","no","pt","ru","se","zh"]
const langNames=["All Languages","Arabic","German","English","Spanish","French","Hebrew","Italian","Dutch","Norwegian","Portuguese","Russian","Northern Sami","Chinese"];

//Generate a table from the fetched data

const Results=({data})=>{
    return(
        <table id="results"><tbody>
            <tr>
                <th>Title</th>
                <th>Source ID</th>
                <th>Source Name</th>
                <th>Author</th>
                <th>Published At</th>
            </tr>
            {data["articles"].map((x,i)=>(
                                        <tr key={i+1}>
                                            <td><a href={x["url"]} target="_blank">{x["title"]}</a></td>
                                            <td>{x["source"]["id"]}</td>
                                            <td>{x["source"]["name"]}</td>
                                            <td>{x["author"]}</td>
                                            <td>{x["publishedAt"].replace(/T/,"\n").replace(/Z/,"")}</td>
                                        </tr>
                                    ))}
        </tbody></table>
    );
}

//Generate navigation buttons for different pages of the search results

const PageNumbers=({setPage, refresh, page, pageSize, total})=>{
    let k=Math.floor(total/pageSize)+1;
    let n=2;
    let a=[];

    a.push(<button key="first" className="page-button first" onClick={()=>{setPage(1); refresh();}}><i className="fa fa-angle-double-left" /></button>);

    if(page>1) a.push(<button key="prev" className="page-button prev" onClick={()=>{setPage(page-1); refresh();}}><i className="fa fa-angle-left" /></button>);

    if(page>n+1) a.push(<p key="dots1">...</p>);

    for(let i=(page>n+1?page-n:1); i<=(page+n<k?(page>n?page+n:page+(n*2)):k); i++){
        a.push(<button key={i} className={i==page?"page-button current":"page-button"} onClick={()=>{setPage(i); refresh();}}>{i}</button>);
    }

    if(page+n<k) a.push(<p key="dots2">...</p>);

    if(page<k) a.push(<button key="next" className="page-button next" onClick={()=>{setPage(page+1); refresh();}}><i className="fa fa-angle-right" /></button>);

    a.push(<button key="last" className="page-button last" onClick={()=>{setPage(k); refresh();}}><i className="fa fa-angle-double-right" /></button>);

    return(
        <div id="button-area">
            {a}
        </div>
    )
}

const Main=()=>{

    const [search, setSearch]=React.useState("");                                   //Contents of the search bar
    const [loading, setLoading]=React.useState(false);                              //Trigger for the loading screen
    const [trig, setTrig]=React.useState(false);                                    //Trigger for fetching data from the API
    const [page, setPage]=React.useState(1);                                        //Current results page
    const [pageSize, setPageSize]=React.useState(15);                               //Page size input
    const [currSize, setCurrSize]=React.useState(15);                               //Page size used to fetch data
    const [language, setLanguage]=React.useState("");                               //Language input
    const [apikey, setApikey]=React.useState("840369e692f4458f8c10d87b7dd2d783")    //API key required for fetching data
    const [data, setData]=React.useState("");                                       //Data fetched from the API

    React.useEffect(()=>{

                            //Function for fetching data

                            if(trig==false)                 //Fetches data only when the button is pressed
                                return;
                            setTrig(false);
                            setCurrSize(pageSize);

                            document.getElementById("loading").className="load-show";       //Triggers the loading screen

                            let url="https://newsapi.org/v2/everything?q="+search+"&language="+language+"&page="+page+"&pageSize="+pageSize+"&apiKey="+apikey;

                            var file = new XMLHttpRequest();
                            file.open("GET", url, true);
                            file.onload=(e)=>{
                                if(file.readyState === 4){
                                    setData(JSON.parse(file.responseText));
                                }
                                document.getElementById("loading").className="load-hide";   //Closes the loading screen
                            };
                            file.onerror=(e)=>{
                                console.error(file.statusText);
                            };
                            file.send(null);

                        });

    React.useEffect(()=>{

                        //Function for drag-scrollable div when screen size is small

                            if(!document.getElementById("results-container"))
                                return;

                            const slider = document.getElementById("results-container");
                            let isDown = false;
                            let startX;
                            let scrollLeft;

                            slider.addEventListener("mousedown", e => {
                                isDown = true;
                                slider.classList.add("active");
                                startX = e.pageX - slider.offsetLeft;
                                scrollLeft = slider.scrollLeft;
                            });

                            slider.addEventListener("mouseleave", () => {
                                isDown = false;
                                slider.classList.remove("active");
                            });

                            slider.addEventListener("mouseup", () => {
                                isDown = false;
                                slider.classList.remove("active");
                            });

                            slider.addEventListener("mousemove", e => {
                                if (!isDown) return;
                                e.preventDefault();
                                const x = e.pageX - slider.offsetLeft;
                                const walk = x - startX;
                                slider.scrollLeft = scrollLeft - walk;
                            });
                    })

    return(
        <div id="main">
            <div id="search-area">
                <label id="api-bar-label">
                    Enter API Key:
                    <input type="text" id="api-bar" value={apikey} onChange={(e)=>{setApikey(e.target.value)}}></input>
                </label>
                <input type="text" id="search-bar" placeholder="Search" onChange={(e)=>{setSearch(e.target.value)}}></input>
                <select id="language" defaultValue="All Languages" onChange={(e)=>{setLanguage(langList[langNames.indexOf(event.target.value)])}}>
                    {langNames.map(x=><option key={x}>{x}</option>)}
                </select>
                <label id="page-size">
                    <input id="slider" type="range" min="5" max="100" value={pageSize} step="5" onInput={(event)=>setPageSize(event.target.value)} />
                    Items per Page: {pageSize}
                </label>
                <button id="search" onClick={()=>setTrig(true)}>Search</button>
            </div>
            <hr />
            <div id="results-area">
                <h1 className="load-hide" id="loading">Loading</h1>
                {data!=""                                                           //Generates search results if found, or an error screen if not
                        ?data["status"]=="error"
                            ?[<h3 id="error-head">Error!</h3>,<p id="error">{data["message"]}</p>]
                            :data["totalResults"]==0
                                ?<h3 id="error-head">No Search Results!</h3>
                                :[
                                    <PageNumbers setPage={setPage} refresh={()=>setTrig(true)} page={page} pageSize={currSize} total={data["totalResults"]} />,
                                    <div id="results-container" className="scroll"><Results data={data} /></div>,
                                    <PageNumbers setPage={setPage} refresh={()=>setTrig(true)} page={page} pageSize={pageSize} total={data["totalResults"]} />
                                ]
                        :<p />}
            </div>
        </div>
    );
}

ReactDOM.render(<Main />, document.getElementById("root"));
