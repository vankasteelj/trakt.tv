# Trakt.tv available methods 

This help doc was last generated for trakt.tv@6.0.2 on Wed Nov 08 2017

## How to read the table ?

It's simple JS, here's how to use the table below: 
> method({required_argument: 'value'}) 

For example: 
```js 
trakt.shows.summary({id: 'game-of-thrones'}).then(console.log) 
``` 

With optional arguments and pagination: 
```js 
trakt.seasons.comments({ 
  id: 'game-of-thrones', 
  season: 1, 
  sort: 'likes', 
  page: 1, 
  limit: 5 
}).then(console.log) 
```

## Fields explaination 
- **Method**: provided that `trakt` is the spawned instance of the 'trakt.tv' client, it's the function to call in order to request the API 
- **OAUTH**: if you need a user to be authenticated and logged in to make the call 
- **Required arguments**: they need to be passed as arguments (embded in a object) to the Method function
- **Optional arguments**: arguments not required by the API, can also be embded in the same object as above
- **Pagination**: you can send `pagination:true` in the object arg to trigger the pagination, or `page:X,limit:Y` (where X,Y are integers) to navigate in further calls
- **Extended**: the method can be extended with one (or all) of the keywords
- **Type**: the HTTP method used under the hood 
- **URI**: the actual URL contacted at api.trakt.tv


## Table
| Method | OAUTH | Required arguments | Optional arguments | Pagination | Extended | Type | URI |
|--------|:-----:|--------------------|--------------------|:----------:|----------|:----:|----:|
| trakt.calendars.my.shows() | required | *none* | start_date, days | *none* | "full" | GET | api.trakt.tv/calendars/my/shows |
| trakt.calendars.my.new_shows() | required | *none* | start_date, days | *none* | "full" | GET | api.trakt.tv/calendars/my/shows/new |
| trakt.calendars.my.premieres_shows() | required | *none* | start_date, days | *none* | "full" | GET | api.trakt.tv/calendars/my/shows/premieres |
| trakt.calendars.my.movies() | required | *none* | start_date, days | *none* | "full" | GET | api.trakt.tv/calendars/my/movies |
| trakt.calendars.my.dvd() | required | *none* | start_date, days | *none* | "full" | GET | api.trakt.tv/calendars/my/dvd |
| trakt.calendars.all.shows() | *none* | *none* | start_date, days | *none* | "full" | GET | api.trakt.tv/calendars/all/shows |
| trakt.calendars.all.new_shows() | *none* | *none* | start_date, days | *none* | "full" | GET | api.trakt.tv/calendars/all/shows/new |
| trakt.calendars.all.premieres_shows() | *none* | *none* | start_date, days | *none* | "full" | GET | api.trakt.tv/calendars/all/shows/premieres |
| trakt.calendars.all.movies() | *none* | *none* | start_date, days | *none* | "full" | GET | api.trakt.tv/calendars/all/movies |
| trakt.calendars.all.dvd() | *none* | *none* | start_date, days | *none* | "full" | GET | api.trakt.tv/calendars/all/dvd |
| trakt.checkin.add() | required | *none* | movie, episode, sharing, message, venue_id, venue_name, app_version, app_date | *none* | *none* | POST | api.trakt.tv/checkin |
| trakt.checkin.delete() | required | *none* | *none* | *none* | *none* | DELETE | api.trakt.tv/checkin |
| trakt.certifications() | *none* | type | *none* | *none* | *none* | GET | api.trakt.tv/certifications/**type** |
| trakt.comments.comment.add() | required | *none* | movie, show, season, episode, list, comment, spoiler, review | *none* | *none* | POST | api.trakt.tv/comments |
| trakt.comments.comment.get() | *none* | id | *none* | *none* | *none* | GET | api.trakt.tv/comments/**id** |
| trakt.comments.comment.update() | required | id | comment, spoiler, review | *none* | *none* | PUT | api.trakt.tv/comments/**id** |
| trakt.comments.comment.remove() | required | id | *none* | *none* | *none* | DELETE | api.trakt.tv/comments/**id** |
| trakt.comments.replies.get() | required | id | *none* | paginated | *none* | GET | api.trakt.tv/comments/**id**/replies |
| trakt.comments.replies.add() | required | id | comment, spoiler | *none* | *none* | POST | api.trakt.tv/comments/**id**/replies |
| trakt.comments.like.add() | required | id | *none* | *none* | *none* | POST | api.trakt.tv/comments/**id**/like |
| trakt.comments.like.remove() | required | id | *none* | *none* | *none* | DELETE | api.trakt.tv/comments/**id**/like |
| trakt.genres() | *none* | type | *none* | *none* | *none* | GET | api.trakt.tv/genres/**type** |
| trakt.movies.trending() | *none* | *none* | *none* | paginated | "full" | GET | api.trakt.tv/movies/trending |
| trakt.movies.popular() | *none* | *none* | *none* | paginated | "full" | GET | api.trakt.tv/movies/popular |
| trakt.movies.played() | *none* | *none* | period | paginated | "full" | GET | api.trakt.tv/movies/played |
| trakt.movies.watched() | *none* | *none* | period | paginated | "full" | GET | api.trakt.tv/movies/watched |
| trakt.movies.collected() | *none* | *none* | period | paginated | "full" | GET | api.trakt.tv/movies/collected |
| trakt.movies.anticipated() | *none* | *none* | *none* | paginated | "full" | GET | api.trakt.tv/movies/anticipated |
| trakt.movies.boxoffice() | *none* | *none* | *none* | *none* | "full" | GET | api.trakt.tv/movies/boxoffice |
| trakt.movies.updates() | *none* | *none* | start_date | paginated | "full" | GET | api.trakt.tv/movies/updates |
| trakt.movies.summary() | *none* | id | *none* | *none* | "full" | GET | api.trakt.tv/movies/**id** |
| trakt.movies.aliases() | *none* | id | *none* | *none* | *none* | GET | api.trakt.tv/movies/**id**/aliases |
| trakt.movies.releases() | *none* | id | country | *none* | *none* | GET | api.trakt.tv/movies/**id**/releases |
| trakt.movies.translations() | *none* | id | language | *none* | *none* | GET | api.trakt.tv/movies/**id**/translations |
| trakt.movies.comments() | *none* | id | sort | paginated | *none* | GET | api.trakt.tv/movies/**id**/comments |
| trakt.movies.lists() | *none* | id | type, sort | paginated | *none* | GET | api.trakt.tv/movies/**id**/lists |
| trakt.movies.people() | *none* | id | *none* | *none* | "full" | GET | api.trakt.tv/movies/**id**/people |
| trakt.movies.ratings() | *none* | id | *none* | *none* | *none* | GET | api.trakt.tv/movies/**id**/ratings |
| trakt.movies.related() | *none* | id | limit | *none* | "full" | GET | api.trakt.tv/movies/**id**/related |
| trakt.movies.stats() | *none* | id | *none* | *none* | *none* | GET | api.trakt.tv/movies/**id**/stats |
| trakt.movies.watching() | *none* | id | *none* | *none* | "full" | GET | api.trakt.tv/movies/**id**/watching |
| trakt.networks() | *none* | *none* | *none* | *none* | *none* | GET | api.trakt.tv/networks |
| trakt.people.summary() | *none* | id | *none* | *none* | "full" | GET | api.trakt.tv/people/**id** |
| trakt.people.movies() | *none* | id | *none* | *none* | "full" | GET | api.trakt.tv/people/**id**/movies |
| trakt.people.shows() | *none* | id | *none* | *none* | "full" | GET | api.trakt.tv/people/**id**/shows |
| trakt.recommendations.movies.get() | required | *none* | limit | *none* | "full" | GET | api.trakt.tv/recommendations/movies |
| trakt.recommendations.movies.hide() | required | id | *none* | *none* | *none* | DELETE | api.trakt.tv/recommendations/movies/**id** |
| trakt.recommendations.shows.get() | required | *none* | limit | *none* | "full" | GET | api.trakt.tv/recommendations/shows |
| trakt.recommendations.shows.hide() | required | id | *none* | *none* | *none* | DELETE | api.trakt.tv/recommendations/shows/**id** |
| trakt.scrobble.start() | required | *none* | movie, episode, progress, app_version, app_date | *none* | *none* | POST | api.trakt.tv/scrobble/start |
| trakt.scrobble.pause() | required | *none* | movie, episode, progress, app_version, app_date | *none* | *none* | POST | api.trakt.tv/scrobble/pause |
| trakt.scrobble.stop() | required | *none* | movie, episode, progress, app_version, app_date | *none* | *none* | POST | api.trakt.tv/scrobble/stop |
| trakt.search.text() | *none* | type, query | fields | paginated | "full" | GET | api.trakt.tv/search/**type** |
| trakt.search.id() | *none* | id_type, id | type, fields | paginated | "full" | GET | api.trakt.tv/search/**id_type**/**id** |
| trakt.shows.trending() | *none* | *none* | *none* | paginated | "full" | GET | api.trakt.tv/shows/trending |
| trakt.shows.popular() | *none* | *none* | *none* | paginated | "full" | GET | api.trakt.tv/shows/popular |
| trakt.shows.played() | *none* | *none* | period | paginated | "full" | GET | api.trakt.tv/shows/played |
| trakt.shows.watched() | *none* | *none* | period | paginated | "full" | GET | api.trakt.tv/shows/watched |
| trakt.shows.collected() | *none* | *none* | period | paginated | "full" | GET | api.trakt.tv/shows/collected |
| trakt.shows.anticipated() | *none* | *none* | *none* | paginated | "full" | GET | api.trakt.tv/shows/anticipated |
| trakt.shows.updates() | *none* | *none* | start_date | paginated | "full" | GET | api.trakt.tv/shows/updates |
| trakt.shows.summary() | *none* | id | *none* | *none* | "full" | GET | api.trakt.tv/shows/**id** |
| trakt.shows.aliases() | *none* | id | *none* | *none* | *none* | GET | api.trakt.tv/shows/**id**/aliases |
| trakt.shows.translations() | *none* | id | language | *none* | *none* | GET | api.trakt.tv/shows/**id**/translations |
| trakt.shows.comments() | *none* | id | sort | paginated | *none* | GET | api.trakt.tv/shows/**id**/comments |
| trakt.shows.lists() | *none* | id | type, sort | paginated | *none* | GET | api.trakt.tv/shows/**id**/lists |
| trakt.shows.progress.collection() | required | id | hidden, specials, count_specials | *none* | *none* | GET | api.trakt.tv/shows/**id**/progress/collection |
| trakt.shows.progress.watched() | required | id | hidden, specials, count_specials | *none* | "full" | GET | api.trakt.tv/shows/**id**/progress/watched |
| trakt.shows.people() | *none* | id | *none* | *none* | "full" | GET | api.trakt.tv/shows/**id**/people |
| trakt.shows.ratings() | *none* | id | *none* | *none* | *none* | GET | api.trakt.tv/shows/**id**/ratings |
| trakt.shows.related() | *none* | id | *none* | paginated | "full" | GET | api.trakt.tv/shows/**id**/related |
| trakt.shows.stats() | *none* | id | *none* | *none* | *none* | GET | api.trakt.tv/shows/**id**/stats |
| trakt.shows.watching() | *none* | id | *none* | *none* | "full" | GET | api.trakt.tv/shows/**id**/watching |
| trakt.shows.next_episode() | *none* | id | *none* | *none* | "full" | GET | api.trakt.tv/shows/**id**/next_episode |
| trakt.shows.last_episode() | *none* | id | *none* | *none* | "full" | GET | api.trakt.tv/shows/**id**/last_episode |
| trakt.seasons.summary() | *none* | id | *none* | *none* | "full", "episodes" | GET | api.trakt.tv/shows/**id**/seasons |
| trakt.seasons.season() | *none* | id, season | translations | *none* | "full" | GET | api.trakt.tv/shows/**id**/seasons/**season** |
| trakt.seasons.comments() | *none* | id, season | sort | paginated | *none* | GET | api.trakt.tv/shows/**id**/seasons/**season**/comments |
| trakt.seasons.lists() | *none* | id, season | type, sort | paginated | *none* | GET | api.trakt.tv/shows/**id**/seasons/**season**/lists |
| trakt.seasons.ratings() | *none* | id, season | *none* | *none* | *none* | GET | api.trakt.tv/shows/**id**/seasons/**season**/ratings |
| trakt.seasons.watching() | *none* | id, season | *none* | *none* | "full" | GET | api.trakt.tv/shows/**id**/seasons/**season**/watching |
| trakt.episodes.summary() | *none* | id, season, episode | *none* | *none* | "full" | GET | api.trakt.tv/shows/**id**/seasons/**season**/episodes/**episode** |
| trakt.episodes.translations() | *none* | id, season, episode | language | *none* | *none* | GET | api.trakt.tv/shows/**id**/seasons/**season**/episodes/**episode**/translations |
| trakt.episodes.comments() | *none* | id, season, episode | sort | paginated | *none* | GET | api.trakt.tv/shows/**id**/seasons/**season**/episodes/**episode**/comments |
| trakt.episodes.lists() | *none* | id, season, episode | type, sort | paginated | *none* | GET | api.trakt.tv/shows/**id**/seasons/**season**/episodes/**episode**/lists |
| trakt.episodes.ratings() | *none* | id, season, episode | *none* | *none* | *none* | GET | api.trakt.tv/shows/**id**/seasons/**season**/episodes/**episode**/ratings |
| trakt.episodes.stats() | *none* | id, season, episode | *none* | *none* | *none* | GET | api.trakt.tv/shows/**id**/seasons/**season**/episodes/**episode**/stats |
| trakt.episodes.watching() | *none* | id, season, episode | *none* | *none* | "full" | GET | api.trakt.tv/shows/**id**/seasons/**season**/episodes/**episode**/watching |
| trakt.sync.last_activities() | required | *none* | *none* | *none* | *none* | GET | api.trakt.tv/sync/last_activities |
| trakt.sync.playback.get() | required | *none* | type, limit | *none* | *none* | GET | api.trakt.tv/sync/playback |
| trakt.sync.playback.remove() | required | id | *none* | *none* | *none* | DELETE | api.trakt.tv/sync/playback/**id** |
| trakt.sync.collection.get() | required | type | *none* | *none* | "full", "metadata" | GET | api.trakt.tv/sync/collection/**type** |
| trakt.sync.collection.add() | required | *none* | movies, shows, episodes | *none* | *none* | POST | api.trakt.tv/sync/collection |
| trakt.sync.collection.remove() | required | *none* | movies, shows, episodes | *none* | *none* | POST | api.trakt.tv/sync/collection/remove |
| trakt.sync.watched() | required | type | *none* | *none* | "full", "noseasons" | GET | api.trakt.tv/sync/watched/**type** |
| trakt.sync.history.get() | required | *none* | type, id, start_at, end_at | paginated | "full" | GET | api.trakt.tv/sync/history |
| trakt.sync.history.add() | required | *none* | movies, shows, episodes | *none* | *none* | POST | api.trakt.tv/sync/history |
| trakt.sync.history.remove() | required | *none* | movies, shows, episodes, ids | *none* | *none* | POST | api.trakt.tv/sync/history/remove |
| trakt.sync.ratings.get() | required | *none* | rating, type | *none* | "full" | GET | api.trakt.tv/sync/ratings |
| trakt.sync.ratings.add() | required | *none* | movies, shows, episodes | *none* | *none* | POST | api.trakt.tv/sync/ratings |
| trakt.sync.ratings.remove() | required | *none* | movies, shows, episodes | *none* | *none* | POST | api.trakt.tv/sync/ratings/remove |
| trakt.sync.watchlist.get() | required | *none* | type | *optional* | "full" | GET | api.trakt.tv/sync/watchlist |
| trakt.sync.watchlist.add() | required | *none* | movies, shows, episodes | *none* | *none* | POST | api.trakt.tv/sync/watchlist |
| trakt.sync.watchlist.remove() | required | *none* | movies, shows, episodes | *none* | *none* | POST | api.trakt.tv/sync/watchlist/remove |
| trakt.users.settings() | required | *none* | *none* | *none* | *none* | GET | api.trakt.tv/users/settings |
| trakt.users.requests.get() | required | *none* | *none* | *none* | "full" | GET | api.trakt.tv/users/requests |
| trakt.users.requests.approve() | required | id | *none* | *none* | *none* | POST | api.trakt.tv/users/requests/**id** |
| trakt.users.requests.deny() | required | id | *none* | *none* | *none* | DELETE | api.trakt.tv/users/requests/**id** |
| trakt.users.hidden.get() | required | section | type | paginated | "full" | GET | api.trakt.tv/users/hidden/**section** |
| trakt.users.hidden.add() | required | section | movies, shows, episodes | *none* | *none* | POST | api.trakt.tv/users/hidden/**section** |
| trakt.users.hidden.remove() | required | section | movies, shows, episodes | *none* | *none* | POST | api.trakt.tv/users/hidden/**section**/remove |
| trakt.users.likes() | required | username | type | paginated | *none* | GET | api.trakt.tv/users/**username**/likes |
| trakt.users.profile() | *optional* | username | *none* | *none* | "full", "vip" | GET | api.trakt.tv/users/**username** |
| trakt.users.collection() | *optional* | username, type | *none* | *none* | "full", "metadata" | GET | api.trakt.tv/users/**username**/collection/**type** |
| trakt.users.comments() | *optional* | username | comment_type, type | paginated | "full" | GET | api.trakt.tv/users/**username**/comments |
| trakt.users.lists.get() | *optional* | username | *none* | *none* | *none* | GET | api.trakt.tv/users/**username**/lists |
| trakt.users.lists.create() | required | username | name, description, privacy, display_numbers, allow_comments | *none* | *none* | POST | api.trakt.tv/users/**username**/lists |
| trakt.users.list.get() | *optional* | username, id | *none* | *none* | *none* | GET | api.trakt.tv/users/**username**/lists/**id** |
| trakt.users.list.update() | required | username, id | name, description, privacy, display_numbers, allow_comments | *none* | *none* | PUT | api.trakt.tv/users/**username**/lists/**id** |
| trakt.users.list.delete() | required | username, id | *none* | *none* | *none* | DELETE | api.trakt.tv/users/**username**/lists/**id** |
| trakt.users.list.like.add() | required | username, id | *none* | *none* | *none* | POST | api.trakt.tv/users/**username**/lists/**id**/like |
| trakt.users.list.like.remove() | required | username, id | *none* | *none* | *none* | DELETE | api.trakt.tv/users/**username**/lists/**id**/like |
| trakt.users.list.items.get() | *optional* | username, id | type | *optional* | "full" | GET | api.trakt.tv/users/**username**/lists/**id**/items |
| trakt.users.list.items.add() | required | username, id | movies, shows, people | *none* | *none* | POST | api.trakt.tv/users/**username**/lists/**id**/items |
| trakt.users.list.items.remove() | required | username, id | movies, shows, people | *none* | *none* | POST | api.trakt.tv/users/**username**/lists/**id**/items/remove |
| trakt.users.list.comments() | *none* | username, id | sort | paginated | *none* | GET | api.trakt.tv/users/**username**/lists/**id**/comments |
| trakt.users.follow.add() | required | username | *none* | *none* | *none* | POST | api.trakt.tv/users/**username**/follow |
| trakt.users.follow.remove() | required | username | *none* | *none* | *none* | DELETE | api.trakt.tv/users/**username**/follow |
| trakt.users.followers() | *optional* | username | *none* | *none* | "full" | GET | api.trakt.tv/users/**username**/followers |
| trakt.users.following() | *optional* | username | *none* | *none* | "full" | GET | api.trakt.tv/users/**username**/following |
| trakt.users.friends() | *optional* | username | *none* | *none* | "full" | GET | api.trakt.tv/users/**username**/friends |
| trakt.users.history() | *optional* | username | type, item_id, start_at, end_at | paginated | "full" | GET | api.trakt.tv/users/**username**/history |
| trakt.users.ratings() | *optional* | username | rating, type | *none* | "full" | GET | api.trakt.tv/users/**username**/ratings |
| trakt.users.watchlist() | *optional* | username | type | *optional* | "full" | GET | api.trakt.tv/users/**username**/watchlist |
| trakt.users.watching() | *optional* | username | *none* | *none* | *none* | GET | api.trakt.tv/users/**username**/watching |
| trakt.users.watched() | *optional* | username, type | *none* | *none* | "full", "noseasons" | GET | api.trakt.tv/users/**username**/watched/**type** |
| trakt.users.stats() | *optional* | username | *none* | *none* | *none* | GET | api.trakt.tv/users/**username**/stats |