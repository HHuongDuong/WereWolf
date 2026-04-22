package com.werewolf.vote.exception;

public class VoteException extends RuntimeException {
    private final String code;

    public VoteException(String code, String message) {
        super(message);
        this.code = code;
    }

    public String getCode() { return code; }
}
