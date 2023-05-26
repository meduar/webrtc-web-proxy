package main

import (
	"fmt"
	"rtcproxyserver/communication"
	"sync"
	"time"
)

var wg sync.WaitGroup
var processingConnection int = 0

func main() {
	uptimeTicker := time.NewTicker(5 * time.Second)
	dateTicker := time.NewTicker(10 * time.Second)

	for {
		select {
		case <-uptimeTicker.C:
			if processingConnection == 0 {
				fmt.Println("Checking requests:")
				checkRequests()
			}
		case <-dateTicker.C:
			// run("date")
		}
	}
}

func checkRequests() {
	processingConnection, message := communication.GetClientMessage()
	if processingConnection == 1 {
		wg.Add(1)
		go func() {
			defer wg.Done()
			MakeConnection(message)
		}()
		wg.Wait()
		processingConnection = 0
	}

	return
}
