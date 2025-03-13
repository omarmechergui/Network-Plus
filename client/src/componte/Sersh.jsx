import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

function Sersh() {
    const [isFollowing, setIsFollowing] = useState(false)
    const [search, setSearch] = useState('')
    const [filter, setFilter] = useState('all')
    const [show, setshow] = useState(false)
    const [usersData, setUsersData] = useState(null); // State for user profile data
    const [posts, setPosts] = useState([]); // State for user posts
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
      const [category, setCategory] = useState('');
    
    console.log(search)
    const fetchsearch = async (e) => {
        e.preventDefault()
        try {
            setLoading(true);
            const response = await axios.post('http://localhost:5000/api/posts/search', { query: search }, {

                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`, // Replace with actual token logic
                },
            });

            console.log(response)
            if (response.status == 200) {
                setPosts(response.data.posts);
                setUsersData(response.data.users);
            } else {
                throw new Error(response.data.message || 'Failed to fetch posts.');
            }
        } catch (err) {
            console.log(err)
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleFollow = () => {
        setIsFollowing(!isFollowing)
    }

    const handleSearch = (e) => {
        setSearch(e.target.value)
    }

    const handleFilter = (filter) => {
        setFilter(filter)
    }

    return (
        <div style={{ width: '100%', overflowY: 'auto', height: '100vh', overflowX: 'hidden' }}>
            <div style={{ display: 'flex', gap: '10px', width: '100%', justifyContent: 'center', padding: "10px" }}>
                <div className="group">
                    <svg className="icon" aria-hidden="true" viewBox="0 0 24 24">
                        <g>
                            <path d="M21.53 20.47l-3.66-3.66C19.195 15.24 20 13.214 20 11c0-4.97-4.03-9-9-9s-9 4.03-9 9 4.03 9 9 9c2.215 0 4.24-.804 5.808-2.13l3.66 3.66c.147.146.34.22.53.22s.385-.073.53-.22c.295-.293.295-.767.002-1.06zM3.5 11c0-4.135 3.365-7.5 7.5-7.5s7.5 3.365 7.5 7.5-3.365 7.5-7.5 7.5-7.5-3.365-7.5-7.5z" />
                        </g>
                    </svg>
                    <form action="" style={{ width: "100%" }} onSubmit={fetchsearch}>

                        <input onChange={handleSearch} placeholder="Search" type="search" className="input" />
                    </form>
                </div>
            </div>


            <div style={{ display: 'flex', gap: '10px', width: '100%', justifyContent: 'center' }}>
                <button onClick={() => setCategory('')} style={{ backgroundColor: category === '' ? 'blue' : 'white', color: category === '' ? 'white' : 'black', width: '100px', height: '30px', borderRadius: '5px' }}>all<i class="fa-solid fa-caret-down"></i></button>
                <button onClick={() => setCategory('videos')} style={{ backgroundColor: category === 'videos' ? 'blue' : 'white', color: category === 'videos' ? 'white' : 'black', width: '100px', height: '30px', borderRadius: '5px' }}>videos<i class="fa-solid fa-caret-down"></i></button>
                <button onClick={() => setCategory('images')} style={{ backgroundColor: category === 'images' ? 'blue' : 'white', color: category === 'images' ? 'white' : 'black', width: '100px', height: '30px', borderRadius: '5px' }}>posts<i class="fa-solid fa-caret-down"></i></button>
            </div>
            
            <div data-aos="zoom-in">
                <div style={{ display: 'flex', gap: '10px', width: '100vw', overflowX: 'visible', marginTop: '20px', }}>
                    {usersData?.map((user) => <div style={{ gap: '10px', width: '14.5rem', border: '3px solid #000a1a', borderRadius: '10px', boxShadow: '0 0 10px rgba(27, 27, 27, 0.16)', padding: '10px' }}>
                        <Link to={"/User/" + user._id} style={{ textDecoration: 'none' }}>
                            <div style={{ height: '100px', alignItems: 'end', display: 'flex', gap: '10px', backgroundImage: 'url("https://e0.pxfuel.com/wallpapers/651/1001/desktop-wallpaper-abstract-background.jpg")', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', borderRadius: '10px' }}>
                                <img src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png"
                                    alt=""
                                    style={{ width: '50px', height: '50px', borderRadius: '50%', border: '2px solid #3333337a', boxShadow: '0 0 3px rgba(0, 0, 0, 0.3)', }} />
                                <h3>{user.username}</h3>
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <div>
                                    <h2>{user?.followers?.length}</h2>
                                    <p>followers</p>
                                </div>
                                <div>
                                    <h2>{user?.following?.length}</h2>
                                    <p>following</p>
                                </div>
                            </div>
                        </Link>
                        <div>
                            <p>{user.description}</p>

                        </div>
                    </div>)}



                </div>
                <hr />



                <div style={{ display: 'flex', gap: '5px', width: '100%', flexWrap: 'wrap', justifyContent: 'center' }}>

                    {posts.filter((post) => category == "" ? post : category == "videos" ? post.picture.split('.').at(-1) == "mp4" : category == "images" ? post.picture.split('.').at(-1) == "jpg" || post.picture.split('.').at(-1) == "png" || post.picture.split('.').at(-1) == "jpeg" : null).map((post) => (
                        <div id='card_serch' style={{ width: '14rem', maxHeight: '18rem', border: '3px solid #000a1a', borderRadius: '10px', boxShadow: '0 0 5px rgba(27, 27, 27, 0.16)', padding: '10px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <a href={`/User/${post?.userId?._id}`} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <img
                                        src={post.userId.profilePicture}
                                        alt={`${post.username}'s profile`}

                                        style={{ width: '50px', height: '50px', borderRadius: '50%' }}
                                    />

                                    <h3 style={{ fontWeight: "bold" }}>{post?.userId?.username}</h3>
                                </a>

                            </div>
                            <Link to={`/Openpost/${post._id}`}>
                                {post.picture.split('.').at(-1) == "mp4" ? (
                                    <video
                                        id="img_post" style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: '10px' }}
                                        src={post.picture} controls></video>) : (
                                    <img
                                        id="img_post" style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: '10px' }}
                                        src={post.picture} alt="" />
                                )
                                }
                            </Link>

                            <p>{post.description}</p>

                        </div>
                    ))}
                </div>

            </div>
        </div>

    )
}

export default Sersh