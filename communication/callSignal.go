package communication

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
)

var apiurl string = "http://localhost:8000"

type Message struct {
	Sdp string `json:"sdp"`
}

func GetClientMessage() (processing int, message string) {
	var messageClient string

	resp, err := http.Get(apiurl + "/getMessage")

	if err != nil {
		processing = 0
		fmt.Println("error", err)
		return
	}

	defer resp.Body.Close()

	if resp.StatusCode == http.StatusOK {
		body, err := ioutil.ReadAll(resp.Body)
		if err != nil {
			processing = 0
		}

		if err := json.Unmarshal(body, &messageClient); err != nil {
			processing = 0
		}

		if messageClient != "" {
			message = messageClient
			processing = 1
		} else {
			processing = 0
		}
	} else {
		processing = 0
	}

	return
}

func SendResponse(response string) (processing int) {

	message := Message{
		Sdp: response,
	}

	body, _ := json.Marshal(message)
	resp, err := http.Post(apiurl+"/SetServerMessage", "application/json", bytes.NewBuffer(body))

	if err != nil {
		processing = 0
		return
	}

	defer resp.Body.Close()

	if resp.StatusCode == http.StatusOK {
		processing = 1
	} else {
		processing = 0
	}

	return
}
