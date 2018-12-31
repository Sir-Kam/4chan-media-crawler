/*
    Created By:
        Sir-Kam
        https://github.com/Sir-Kam
    On:
        12/30/2018
    At:
        21:50 UTC-4 Non-DST
*/


/**
 * results_handler() .
 * 
 * Functions used for making http requests.
 *
 * @param {string}   theUrl           - Url to make the http get request to.
 * @param {function} callback         - Called after the request and processing of page contents have completed.
 */
const httpreq_async_get = ( theUrl, callback ) =>
{
    const xmlHttp = new XMLHttpRequest( );
    xmlHttp.onreadystatechange = ( ) =>
    { 
        if ( xmlHttp.readyState == 4 && xmlHttp.status == 200 )
            callback( xmlHttp.responseText );
    }
    xmlHttp.open( "GET", theUrl, true ); // true for asynchronous 
    xmlHttp.send( null );
};


/**
 * results .
 * 
 * Contains results of all scraps split into arrays for each media type.
 * 
 * @type {{pic:[],gif:[],webm:[]}}
 */
const results =
{
    lastCount: 0,
    pic:  [ ],
    gif:  [ ],
    webm: [ ]
}


/**
 * results_handler() .
 * 
 * Handles the adding media links to 'results' in their respective array for that media type. 
 *
 * @param {string}   mediaExt         - Extension (type) of media link.
 * @param {string}   mediaLink        - Media link.
 */ 
const results_handler = ( mediaExt, mediaLink ) =>
{
    if ( ![ 'png', 'jpg', 'gif', 'webm' ].includes( mediaExt ) ) return;
    results.lastCount += 1;
    results[ [ 'png', 'jpg' ].includes( mediaExt ) ? 'pic' : mediaExt ].push( mediaLink );
}


/**
 * boards .
 * 
 * Boards object contains all functions for the scraping process & list of boards to use.
 * 
 * @type {Object}
 */
const boards =
{

    /**
     * boards.list .
     * 
     * A list of board Urls to be processed with 'boards.scrap.all(...)'.
     * 
     * @type {Array<string>}
     */
    list: [ ],

    /**
     * boards.populate() .
     * 
     * Populates the 'boards.list' array with the urls of all boards on a main '/?/catalog' page.
     *
     * @example "If you are on page 'http://boards.4channel.org/g/catalog' it will add all board links on '/g/'s catalog."
     */
    populate: ( ) =>
        {
            Array.from( document.getElementsByClassName( 'thread' ) ).forEach( ( ele ) =>
            {
                    boards.list.push( ele.firstChild.href );
            } );
        },

    /**
     * boards.scrap .
     * 
     * Contains both scraping functions: 'all' & 'single'.
     * 
     * @type {Object}
     */
    scrap:
    {

        /**
         * boards.scrap.single() .
         * 
         * Runs the scraping process on a specific board Url.
         * 
         * @example boards.scrap.single( 'http://boards.4channel.org/g/thread/51971506', null, false );
         * 
         * @param {string}   theUrl           - Url to make the http get request to.
         * @param {function} [callback=null]  - Called after the request and processing of page contents have completed.
         * @param {bolean}   [logging=false]  - Determines whether console logging is on.
         */
        single: ( theUrl, callback = null, logging = false ) =>
            {
                httpreq_async_get( theUrl, ( response ) =>
                {
                    const doc = new DOMParser( ).parseFromString( response, "text/html" );
                    results.lastCount = 0;
                    Array.from( doc.getElementsByClassName( 'fileThumb' ) ).forEach( ( ele ) =>
                    {
                        let mediaLink = 'https:' + ele.getAttribute( 'href' );
                        if ( mediaLink != null )
                            results_handler( mediaLink.split( '.' ).reverse( )[ 0 ], mediaLink );
                    } );
                    if (logging)
                        console.info( 'Boards Remaining: ' + boards.list.length.toString( ) + '\n - Completed request: ' + theUrl + '\n - Media found: ' + results.lastCount.toString( ) );
                    if ( callback != null && callback != boards.scrap.all )
                        callback( );
                    if ( callback == boards.scrap.all && boards.list.length > 0 )
                        callback( logging );
                    if ( callback == null || boards.list.length == 0 )
                        console.log( results );
                } );
            },

        /**
         * boards.scrap.all() .
         * 
         * Runs the scraping process on all board Urls in 'boards.list' array.
         * 
         * @example boards.scrap.all( true );
         * 
         * @param {bolean}   [logging=false] - Determines whether console logging is on.
         */
        all: function( logging = false )
            {
                boards.scrap.single( boards.list.shift( ), boards.scrap.all, logging );
            }
    }

};
