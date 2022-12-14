import { Heading, VStack } from "native-base";

import { Header } from "../components/Header";
import { Input } from "../components/Input";
import { Button } from "../components/Button";

export function Find() {
    return (
        <VStack flex={1} bgColor="gray.900">
            <Header title="Buscar por código" showBackButton />

            <VStack mt={8} mx={5} alignItems="center">
                <Heading fontFamily="heading" textAlign="center" fontSize="xl" mb={8} color="white">
                    Encontre um bolão através de seu código único
                </Heading>

                <Input
                    mb={2}
                    placeholder="Qual nome do seu bolão?"
                />

                <Button title="Buscar bolão" />
            </VStack>
        </VStack>
    )
}