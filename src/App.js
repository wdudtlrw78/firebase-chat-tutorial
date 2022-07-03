import {useCallback, useEffect, useRef, useState} from "react";
import {app} from "./firebase";
import {Box, Container, VStack, Button, Input, HStack} from "@chakra-ui/react";
import './App.css';
import Message from "./Components/Message";
import {
    onAuthStateChanged,
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
} from 'firebase/auth';
import {
    getFirestore,
    addDoc,
    collection,
    serverTimestamp,
    onSnapshot,
    query,
    orderBy,
} from 'firebase/firestore';

const auth = getAuth(app);
const db = getFirestore(app);

const loginHandler = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider);
}
const logoutHandler = () => signOut(auth);

function App() {
    const q = query(collection(db, "Messages"), orderBy('createdAt', "asc"));
    const [user, setUser] = useState(false);
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);

    const divForScroll = useRef(null);
    const chatContainer = useRef(null);

    useEffect(() => {
        const unsbscribe = onAuthStateChanged(auth, (data) => {
            setUser(data);
        });

        const unsubscribeForMessage = onSnapshot(q, (snap) => {
            setMessages(snap.docs.map(item => {
                const id = item.id;
                return { id, ...item.data() };
            }));
        });

        return () => {
            unsbscribe();
            unsubscribeForMessage();
        };
    }, []);

    useEffect(() => {
        if (!user || !messages) {
            return;
        }

        chatContainer.current.scrollTo(0, chatContainer.current.scrollHeight);
    }, [user, messages]);

    const submitHandler = useCallback(async (e) => {
        e.preventDefault();

        try {
            setMessage("");

            await addDoc(collection(db, "Messages"), {
                text: message,
                uid: user.uid,
                uri: user.photoURL,
                createdAt: serverTimestamp()
            });

            divForScroll.current.scrollIntoView({behavior: 'smooth'})
        } catch (e) {
            alert(e);
        }
    }, [user, message]);

    const onChangeMessage = useCallback((e) => {
        setMessage(e.target.value);
    }, []);

    return (
        <Box bg={"red.50"}>
            {
                user ? (
                    <Container h={"100vh"} bg={'white'}>
                        <VStack h={"100vh"} padding={"4"}>
                            <Button onClick={logoutHandler} colorScheme={"red"} w={"full"}>Logout</Button>

                            <VStack w={"full"} h={"full"} overflow={'auto'} ref={chatContainer}>
                                {
                                    messages.map(item => (
                                        <Message
                                            key={item.id}
                                            user={item.uid === user.uid ? 'me' : 'other'}
                                            text={item.text} uri={item.uri}
                                        />
                                    ))
                                }

                                <div ref={divForScroll}/>
                            </VStack>


                            <form style={{width: '100%'}} onSubmit={submitHandler}>
                                <HStack>
                                    <Input value={message} onChange={onChangeMessage}
                                           placeholder={"Enter a Message..."}/>
                                    <Button type='submit' colorScheme={"purple"} type={'submit'}>Send</Button>
                                </HStack>
                            </form>
                        </VStack>
                    </Container>
                ) : (
                    <VStack justifyContent={'center'} h={'100vh'} bg={'white'}>
                        <Button onClick={loginHandler} colorScheme={'purple'}>Sign In With Google</Button>
                    </VStack>
                )
            }
        </Box>
    );
}

export default App;
